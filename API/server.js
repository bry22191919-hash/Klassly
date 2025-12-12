const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Database = require("better-sqlite3")

const app = express()
const PORT = 5000

// Initialize database
const db = new Database("klassly.db")
require("./tables")(db)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const loginAttempts = new Map() // IP -> { count, lastAttempt, banUntil }

function normalizeIP(ip) {
  if (!ip) return "unknown"
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1"
  if (ip.startsWith("::ffff:")) return ip.substring(7)
  return ip
}

function getRateLimitInfo(ip) {
  const normalizedIP = normalizeIP(ip)
  if (!loginAttempts.has(normalizedIP)) {
    loginAttempts.set(normalizedIP, { count: 0, lastAttempt: 0, banUntil: 0 })
  }
  return loginAttempts.get(normalizedIP)
}

function getBanDuration(failureCount) {
  // Escalating ban times: 30s, 1m, 2m, 10m, 24h
  if (failureCount >= 15) return 24 * 60 * 60 * 1000 // 24 hours
  if (failureCount >= 12) return 10 * 60 * 1000 // 10 minutes
  if (failureCount >= 9) return 2 * 60 * 1000 // 2 minutes
  if (failureCount >= 6) return 60 * 1000 // 1 minute
  if (failureCount >= 3) return 30 * 1000 // 30 seconds
  return 0
}

function formatBanTime(ms) {
  const seconds = Math.ceil(ms / 1000)
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""}`
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""}`
  }
  return `${seconds} second${seconds > 1 ? "s" : ""}`
}

function checkRateLimit(ip) {
  const info = getRateLimitInfo(ip)
  const now = Date.now()

  // Check if currently banned
  if (info.banUntil > 0 && now < info.banUntil) {
    const remainingMs = info.banUntil - now
    return {
      blocked: true,
      remainingSeconds: Math.ceil(remainingMs / 1000),
      remainingFormatted: formatBanTime(remainingMs),
    }
  }

  // Reset count if last attempt was more than 1 hour ago
  if (info.lastAttempt > 0 && now - info.lastAttempt > 60 * 60 * 1000) {
    info.count = 0
    info.banUntil = 0
  }

  return { blocked: false }
}

function recordFailedAttempt(ip) {
  const info = getRateLimitInfo(ip)
  const now = Date.now()

  info.count++
  info.lastAttempt = now

  const banDuration = getBanDuration(info.count)
  if (banDuration > 0) {
    info.banUntil = now + banDuration
  }

  return { count: info.count, banDuration, banUntil: info.banUntil }
}

function resetAttempts(ip) {
  const normalizedIP = normalizeIP(ip)
  if (loginAttempts.has(normalizedIP)) {
    loginAttempts.delete(normalizedIP)
  }
}

// Middleware
app.set("trust proxy", true)
app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())
app.use(
  session({
    secret: "klassly-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 },
  }),
)
app.use("/uploads", express.static(uploadsDir))

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  req.user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.userId)
  if (!req.user) {
    return res.status(401).json({ error: "User not found" })
  }
  next()
}

function requireTeacher(req, res, next) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access required" })
  }
  next()
}

// Generate unique class code
function generateClassCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Klassly API is running", status: "ok" })
})

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name, role } = req.body
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fields are required" })
    }
    if (!["teacher", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" })
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existing) {
      return res.status(400).json({ error: "Email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = db
      .prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)")
      .run(email, hashedPassword, name, role)

    req.session.userId = result.lastInsertRowid
    const user = db
      .prepare("SELECT id, email, name, role, avatar, theme FROM users WHERE id = ?")
      .get(result.lastInsertRowid)
    res.json({ user })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/auth/signin", async (req, res) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown"

    // Check rate limit FIRST before anything else
    const rateLimitCheck = checkRateLimit(ip)
    if (rateLimitCheck.blocked) {
      return res.status(429).json({
        error: `Too many failed attempts. Please try again in ${rateLimitCheck.remainingFormatted}.`,
        retryAfter: rateLimitCheck.remainingSeconds,
      })
    }

    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email)

    if (!user) {
      const result = recordFailedAttempt(ip)

      let errorMsg = "Invalid email or password"
      if (result.banUntil > 0) {
        errorMsg = `Invalid credentials. Too many failed attempts. Please wait ${formatBanTime(result.banDuration)}.`
      } else {
        const attemptsUntilBan = 3 - (result.count % 3)
        if (attemptsUntilBan < 3 && result.count > 0) {
          errorMsg = `Invalid credentials. ${attemptsUntilBan} attempt${attemptsUntilBan !== 1 ? "s" : ""} remaining before temporary lock.`
        }
      }

      return res.status(401).json({ error: errorMsg })
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) {
      const result = recordFailedAttempt(ip)

      let errorMsg = "Invalid email or password"
      if (result.banUntil > 0) {
        errorMsg = `Invalid credentials. Too many failed attempts. Please wait ${formatBanTime(result.banDuration)}.`
      } else {
        const attemptsUntilBan = 3 - (result.count % 3)
        if (attemptsUntilBan < 3 && result.count > 0) {
          errorMsg = `Invalid credentials. ${attemptsUntilBan} attempt${attemptsUntilBan !== 1 ? "s" : ""} remaining before temporary lock.`
        }
      }

      return res.status(401).json({ error: errorMsg })
    }

    // Success - reset attempts
    resetAttempts(ip)

    req.session.userId = user.id
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        theme: user.theme,
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar: req.user.avatar,
      theme: req.user.theme,
    },
  })
})

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" })
    }
    res.clearCookie("connect.sid")
    res.json({ message: "Logged out" })
  })
})

app.put("/api/auth/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" })
    }

    // Get fresh user data with password
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const result = db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, req.user.id)

    if (result.changes === 0) {
      return res.status(500).json({ error: "Failed to update password" })
    }

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Profile update
app.put("/api/users/profile", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    const { name, theme } = req.body
    let avatar = req.user.avatar

    if (req.file) {
      avatar = `/uploads/${req.file.filename}`
    }

    db.prepare("UPDATE users SET name = ?, avatar = ?, theme = ? WHERE id = ?").run(
      name || req.user.name,
      avatar,
      theme || req.user.theme || "light",
      req.user.id,
    )

    const user = db.prepare("SELECT id, email, name, role, avatar, theme FROM users WHERE id = ?").get(req.user.id)
    res.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Also support /api/auth/profile for compatibility
app.put("/api/auth/profile", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    const { name, theme } = req.body
    let avatar = req.user.avatar

    if (req.file) {
      avatar = `/uploads/${req.file.filename}`
    }

    db.prepare("UPDATE users SET name = ?, avatar = ?, theme = ? WHERE id = ?").run(
      name || req.user.name,
      avatar,
      theme || req.user.theme || "light",
      req.user.id,
    )

    const user = db.prepare("SELECT id, email, name, role, avatar, theme FROM users WHERE id = ?").get(req.user.id)
    res.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Classes routes
app.get("/api/classes", requireAuth, (req, res) => {
  try {
    let classes
    if (req.user.role === "teacher") {
      classes = db
        .prepare(`
        SELECT c.*, 
          (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count
        FROM classes c 
        WHERE c.teacher_id = ? 
        ORDER BY c.created_at DESC
      `)
        .all(req.user.id)
    } else {
      classes = db
        .prepare(`
          SELECT c.*, u.name as teacher_name,
            (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count
          FROM classes c
          INNER JOIN class_students cs ON c.id = cs.class_id
          INNER JOIN users u ON c.teacher_id = u.id
          WHERE cs.student_id = ?
          ORDER BY cs.joined_at DESC
        `)
        .all(req.user.id)
    }
    res.json({ classes })
  } catch (error) {
    console.error("Get classes error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/classes", requireAuth, requireTeacher, (req, res) => {
  try {
    const { name, description, color } = req.body
    if (!name) {
      return res.status(400).json({ error: "Class name is required" })
    }

    let code
    do {
      code = generateClassCode()
    } while (db.prepare("SELECT id FROM classes WHERE code = ?").get(code))

    const result = db
      .prepare("INSERT INTO classes (name, description, code, teacher_id, color) VALUES (?, ?, ?, ?, ?)")
      .run(name, description || "", code, req.user.id, color || "#4F46E5")

    const newClass = db.prepare("SELECT * FROM classes WHERE id = ?").get(result.lastInsertRowid)
    res.json({ class: newClass })
  } catch (error) {
    console.error("Create class error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/classes/:classId", requireAuth, (req, res) => {
  try {
    const classData = db.prepare("SELECT * FROM classes WHERE id = ?").get(req.params.classId)
    if (!classData) {
      return res.status(404).json({ error: "Class not found" })
    }
    res.json({ class: classData })
  } catch (error) {
    console.error("Get class error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.put("/api/classes/:classId", requireAuth, requireTeacher, (req, res) => {
  try {
    const { name, description, color } = req.body
    db.prepare("UPDATE classes SET name = ?, description = ?, color = ? WHERE id = ? AND teacher_id = ?").run(
      name,
      description || "",
      color || "#4F46E5",
      req.params.classId,
      req.user.id,
    )
    const updatedClass = db.prepare("SELECT * FROM classes WHERE id = ?").get(req.params.classId)
    res.json({ class: updatedClass })
  } catch (error) {
    console.error("Update class error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.delete("/api/classes/:classId", requireAuth, requireTeacher, (req, res) => {
  try {
    db.prepare("DELETE FROM comments WHERE announcement_id IN (SELECT id FROM announcements WHERE class_id = ?)").run(
      req.params.classId,
    )
    db.prepare(
      "DELETE FROM announcement_files WHERE announcement_id IN (SELECT id FROM announcements WHERE class_id = ?)",
    ).run(req.params.classId)
    db.prepare("DELETE FROM announcements WHERE class_id = ?").run(req.params.classId)
    db.prepare("DELETE FROM submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE class_id = ?)").run(
      req.params.classId,
    )
    db.prepare("DELETE FROM assignments WHERE class_id = ?").run(req.params.classId)
    db.prepare("DELETE FROM class_students WHERE class_id = ?").run(req.params.classId)
    db.prepare("DELETE FROM classes WHERE id = ? AND teacher_id = ?").run(req.params.classId, req.user.id)
    res.json({ message: "Class deleted" })
  } catch (error) {
    console.error("Delete class error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Join class
app.post("/api/classes/join", requireAuth, (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Only students can join classes" })
    }

    const { code } = req.body
    const classData = db.prepare("SELECT * FROM classes WHERE code = ?").get(code?.toUpperCase())
    if (!classData) {
      return res.status(404).json({ error: "Class not found" })
    }

    const existing = db
      .prepare("SELECT id FROM class_students WHERE class_id = ? AND student_id = ?")
      .get(classData.id, req.user.id)
    if (existing) {
      return res.status(400).json({ error: "Already enrolled" })
    }

    db.prepare("INSERT INTO class_students (class_id, student_id) VALUES (?, ?)").run(classData.id, req.user.id)
    res.json({ class: classData })
  } catch (error) {
    console.error("Join class error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Class members
app.get("/api/classes/:classId/students", requireAuth, (req, res) => {
  try {
    const students = db
      .prepare(`
        SELECT u.id, u.name, u.email, u.avatar, cs.joined_at
        FROM users u
        INNER JOIN class_students cs ON u.id = cs.student_id
        WHERE cs.class_id = ?
        ORDER BY u.name
      `)
      .all(req.params.classId)

    const classData = db.prepare("SELECT teacher_id FROM classes WHERE id = ?").get(req.params.classId)
    const teacher = db.prepare("SELECT id, name, email, avatar FROM users WHERE id = ?").get(classData?.teacher_id)

    res.json({ students, teacher })
  } catch (error) {
    console.error("Get students error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.delete("/api/classes/:classId/students/:studentId", requireAuth, requireTeacher, (req, res) => {
  try {
    db.prepare("DELETE FROM class_students WHERE class_id = ? AND student_id = ?").run(
      req.params.classId,
      req.params.studentId,
    )
    res.json({ message: "Student removed" })
  } catch (error) {
    console.error("Remove student error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Assignments routes
app.get("/api/assignments/:classId", requireAuth, (req, res) => {
  try {
    const assignments = db
      .prepare("SELECT * FROM assignments WHERE class_id = ? ORDER BY due_date ASC")
      .all(req.params.classId)
    res.json({ assignments })
  } catch (error) {
    console.error("Get assignments error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/assignments", requireAuth, requireTeacher, (req, res) => {
  try {
    const { classId, title, description, dueDate, points } = req.body
    if (!classId || !title || !dueDate) {
      return res.status(400).json({ error: "Class ID, title, and due date are required" })
    }

    const result = db
      .prepare("INSERT INTO assignments (class_id, title, description, due_date, points) VALUES (?, ?, ?, ?, ?)")
      .run(classId, title, description || "", dueDate, points || 100)

    const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(result.lastInsertRowid)
    res.json({ assignment })
  } catch (error) {
    console.error("Create assignment error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.delete("/api/assignments/:assignmentId", requireAuth, requireTeacher, (req, res) => {
  try {
    db.prepare("DELETE FROM submissions WHERE assignment_id = ?").run(req.params.assignmentId)
    db.prepare("DELETE FROM assignments WHERE id = ?").run(req.params.assignmentId)
    res.json({ message: "Assignment deleted" })
  } catch (error) {
    console.error("Delete assignment error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Assignment status (for teachers to see submissions)
app.get("/api/assignments/:assignmentId/status", requireAuth, (req, res) => {
  try {
    const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(req.params.assignmentId)
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" })
    }

    const students = db
      .prepare(`
        SELECT u.id, u.name, u.email, u.avatar,
          s.id as submission_id, s.content, s.file_path, s.file_name, s.submitted_at, s.grade
        FROM users u
        INNER JOIN class_students cs ON u.id = cs.student_id
        LEFT JOIN submissions s ON u.id = s.student_id AND s.assignment_id = ?
        WHERE cs.class_id = ?
        ORDER BY u.name
      `)
      .all(req.params.assignmentId, assignment.class_id)

    res.json({ assignment, students })
  } catch (error) {
    console.error("Get assignment status error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Grade submission
app.put("/api/submissions/:submissionId/grade", requireAuth, requireTeacher, (req, res) => {
  try {
    const { grade } = req.body
    db.prepare("UPDATE submissions SET grade = ? WHERE id = ?").run(grade, req.params.submissionId)
    const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(req.params.submissionId)
    res.json({ submission })
  } catch (error) {
    console.error("Grade submission error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Upcoming assignments for students
app.get("/api/assignments/upcoming/:studentId", requireAuth, (req, res) => {
  try {
    const assignments = db
      .prepare(`
        SELECT a.*, c.name as class_name, c.color as class_color,
          (SELECT id FROM submissions WHERE assignment_id = a.id AND student_id = ?) as submission_id
        FROM assignments a
        INNER JOIN classes c ON a.class_id = c.id
        INNER JOIN class_students cs ON c.id = cs.class_id
        WHERE cs.student_id = ? AND a.due_date >= date('now', '-7 days')
        ORDER BY a.due_date ASC
        LIMIT 10
      `)
      .all(req.params.studentId, req.params.studentId)
    res.json({ assignments })
  } catch (error) {
    console.error("Get upcoming assignments error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Submissions routes
app.post("/api/submissions", requireAuth, upload.single("file"), (req, res) => {
  try {
    const { assignmentId, content } = req.body
    if (!assignmentId) {
      return res.status(400).json({ error: "Assignment ID is required" })
    }

    const existing = db
      .prepare("SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?")
      .get(assignmentId, req.user.id)
    if (existing) {
      // Update existing submission
      const filePath = req.file ? `/uploads/${req.file.filename}` : null
      const fileName = req.file ? req.file.originalname : null

      db.prepare(`
        UPDATE submissions 
        SET content = ?, file_path = COALESCE(?, file_path), file_name = COALESCE(?, file_name), submitted_at = CURRENT_TIMESTAMP
        WHERE assignment_id = ? AND student_id = ?
      `).run(content || "", filePath, fileName, assignmentId, req.user.id)

      const submission = db
        .prepare("SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?")
        .get(assignmentId, req.user.id)
      return res.json({ submission })
    }

    const filePath = req.file ? `/uploads/${req.file.filename}` : null
    const fileName = req.file ? req.file.originalname : null

    const result = db
      .prepare(
        "INSERT INTO submissions (assignment_id, student_id, content, file_path, file_name) VALUES (?, ?, ?, ?, ?)",
      )
      .run(assignmentId, req.user.id, content || "", filePath, fileName)

    const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(result.lastInsertRowid)
    res.json({ submission })
  } catch (error) {
    console.error("Create submission error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.get("/api/submissions/:assignmentId/:studentId", requireAuth, (req, res) => {
  try {
    const submission = db
      .prepare("SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?")
      .get(req.params.assignmentId, req.params.studentId)
    res.json({ submission })
  } catch (error) {
    console.error("Get submission error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Announcements routes
app.get("/api/announcements/:classId", requireAuth, (req, res) => {
  try {
    const announcements = db
      .prepare(`
        SELECT a.*, u.name as author_name, u.avatar as author_avatar
        FROM announcements a
        INNER JOIN users u ON a.teacher_id = u.id
        WHERE a.class_id = ?
        ORDER BY a.created_at DESC
      `)
      .all(req.params.classId)

    // Fetch files for each announcement
    const announcementsWithFiles = announcements.map((announcement) => {
      const files = db.prepare("SELECT * FROM announcement_files WHERE announcement_id = ?").all(announcement.id)
      return { ...announcement, files }
    })

    res.json({ announcements: announcementsWithFiles })
  } catch (error) {
    console.error("Get announcements error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/announcements", requireAuth, requireTeacher, upload.array("files", 5), (req, res) => {
  try {
    const { classId, content, title } = req.body

    // Validate required fields
    if (!classId) {
      return res.status(400).json({ error: "Class ID is required" })
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Announcement content is required" })
    }

    // Verify class exists
    const classData = db.prepare("SELECT id FROM classes WHERE id = ?").get(classId)
    if (!classData) {
      return res.status(404).json({ error: "Class not found" })
    }

    const result = db
      .prepare("INSERT INTO announcements (class_id, teacher_id, content, title) VALUES (?, ?, ?, ?)")
      .run(classId, req.user.id, content.trim(), title ? title.trim() : null)

    const announcementId = result.lastInsertRowid

    // Save uploaded files
    const files = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = `/uploads/${file.filename}`
        db.prepare(
          "INSERT INTO announcement_files (announcement_id, file_path, file_name, file_size) VALUES (?, ?, ?, ?)",
        ).run(announcementId, filePath, file.originalname, file.size)
        files.push({ file_path: filePath, file_name: file.originalname, file_size: file.size })
      }
    }

    const announcement = db
      .prepare(`
        SELECT a.*, u.name as author_name, u.avatar as author_avatar
        FROM announcements a
        INNER JOIN users u ON a.teacher_id = u.id
        WHERE a.id = ?
      `)
      .get(announcementId)

    res.json({ announcement: { ...announcement, files } })
  } catch (error) {
    console.error("Create announcement error:", error)
    res.status(500).json({ error: "Server error: " + error.message })
  }
})

app.delete("/api/announcements/:announcementId", requireAuth, requireTeacher, (req, res) => {
  try {
    db.prepare("DELETE FROM comments WHERE announcement_id = ?").run(req.params.announcementId)
    db.prepare("DELETE FROM announcement_files WHERE announcement_id = ?").run(req.params.announcementId)
    db.prepare("DELETE FROM announcements WHERE id = ?").run(req.params.announcementId)
    res.json({ message: "Announcement deleted" })
  } catch (error) {
    console.error("Delete announcement error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Comments routes
app.get("/api/announcements/:announcementId/comments", requireAuth, (req, res) => {
  try {
    const comments = db
      .prepare(`
        SELECT c.*, u.name as author_name, u.avatar as author_avatar, u.role as author_role
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.announcement_id = ?
        ORDER BY c.created_at ASC
      `)
      .all(req.params.announcementId)
    res.json({ comments })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/announcements/:announcementId/comments", requireAuth, (req, res) => {
  try {
    const { content } = req.body
    if (!content) {
      return res.status(400).json({ error: "Content is required" })
    }

    // Teachers' comments are auto-approved
    const approved = req.user.role === "teacher" ? 1 : 0

    const result = db
      .prepare("INSERT INTO comments (announcement_id, user_id, content, approved) VALUES (?, ?, ?, ?)")
      .run(req.params.announcementId, req.user.id, content, approved)

    const comment = db
      .prepare(`
        SELECT c.*, u.name as author_name, u.avatar as author_avatar, u.role as author_role
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `)
      .get(result.lastInsertRowid)

    res.json({ comment })
  } catch (error) {
    console.error("Create comment error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.put("/api/comments/:commentId/approve", requireAuth, requireTeacher, (req, res) => {
  try {
    db.prepare("UPDATE comments SET approved = 1 WHERE id = ?").run(req.params.commentId)
    res.json({ message: "Comment approved" })
  } catch (error) {
    console.error("Approve comment error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.delete("/api/comments/:commentId", requireAuth, (req, res) => {
  try {
    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(req.params.commentId)
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    // Allow deletion by comment owner or teacher
    if (comment.user_id !== req.user.id && req.user.role !== "teacher") {
      return res.status(403).json({ error: "Not authorized" })
    }

    db.prepare("DELETE FROM comments WHERE id = ?").run(req.params.commentId)
    res.json({ message: "Comment deleted" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Todos routes
app.get("/api/todos", requireAuth, (req, res) => {
  try {
    const todos = db.prepare("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id)
    res.json({ todos })
  } catch (error) {
    console.error("Get todos error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/todos", requireAuth, (req, res) => {
  try {
    const { title } = req.body
    if (!title) {
      return res.status(400).json({ error: "Title is required" })
    }

    const result = db.prepare("INSERT INTO todos (user_id, title) VALUES (?, ?)").run(req.user.id, title)
    const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(result.lastInsertRowid)
    res.json({ todo })
  } catch (error) {
    console.error("Create todo error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.put("/api/todos/:todoId", requireAuth, (req, res) => {
  try {
    const { completed } = req.body
    db.prepare("UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?").run(
      completed ? 1 : 0,
      req.params.todoId,
      req.user.id,
    )
    const todo = db.prepare("SELECT * FROM todos WHERE id = ?").get(req.params.todoId)
    res.json({ todo })
  } catch (error) {
    console.error("Update todo error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.delete("/api/todos/:todoId", requireAuth, (req, res) => {
  try {
    db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?").run(req.params.todoId, req.user.id)
    res.json({ message: "Todo deleted" })
  } catch (error) {
    console.error("Delete todo error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
