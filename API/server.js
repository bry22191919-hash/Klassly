const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./tables"); // your sqlite tables
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --------- AUTH ----------
app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).send('Fill out all requirements');

  const hashed = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`, [name, email, hashed, role], function(err) {
    if (err) return res.status(400).json({ error: "Email already exists" });
    res.json({ message: "User registered", user_id: this.lastID });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: "Wrong password" });
    res.json({ message: "Login success", user });
  });
});

// --------- CLASSES ----------
app.get("/api/dashboard/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT c.id, c.name, c.subject, c.teacher_id, c.class_code, u.name AS teacher_name
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
    WHERE c.teacher_id = ? OR c.id IN (SELECT class_id FROM class_students WHERE student_id = ?)
  `;
  db.all(query, [userId, userId], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post("/api/create-classes", (req, res) => {
  const { name, subject, teacher_id, class_code } = req.body;
  db.run(`INSERT INTO classes (name, subject, teacher_id, class_code) VALUES (?,?,?,?)`,
    [name, subject, teacher_id, class_code],
    function(err) {
      if (err) return res.status(400).json({ error: "Something went wrong." });
      res.json({ message: "Class created", class_id: this.lastID });
    }
  );
});

app.post("/api/join-class", (req, res) => {
  const { class_code: rawClassCode, student_id } = req.body;
  const class_code = rawClassCode.trim();
  db.get(`SELECT * FROM classes WHERE UPPER(class_code) = UPPER(?)`, [class_code], (err, code) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!code) return res.status(400).json({ error: "Class Code ERROR!" });

    db.run(`INSERT INTO class_students (class_id, student_id) VALUES (?,?)`, [code.id, student_id], function(err) {
      if (err) return res.status(400).json({ error: "Already joined or error occurred" });
      res.json({ message: "Successfully joined class", class: code });
    });
  });
});

app.get('/api/class/:id', (req, res) => {
  const classId = req.params.id;
  db.get(`SELECT c.*, u.name as teacher_name FROM classes c LEFT JOIN users u ON c.teacher_id = u.id WHERE c.id = ?`,
    [classId],
    (err, classInfo) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!classInfo) return res.status(404).json({ error: "Class not found" });
      res.json(classInfo);
    }
  );
});

app.get('/api/class/:id/members', (req, res) => {
  const classId = req.params.id;
  db.all(`SELECT u.id AS user_id, u.name FROM class_students cs LEFT JOIN users u ON cs.student_id = u.id WHERE cs.class_id = ?`,
    [classId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

// --------- POSTS / COMMENTS ----------
app.get('/api/class/:id/posts', (req, res) => {
  const classId = req.params.id;
  const query = `
    SELECT 
      p.id AS post_id, p.user_id AS post_user_id, u.name AS post_user_name, p.content AS post_content, p.created_at AS post_created_at,
      c.id AS comment_id, c.user_id AS comment_user_id, cu.name AS comment_user_name, c.content AS comment_content, c.parent_comment_id, c.created_at AS comment_created_at
    FROM post p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON c.post_id = p.id
    LEFT JOIN users cu ON c.user_id = cu.id
    WHERE p.class_id = ?
    ORDER BY p.created_at DESC, c.created_at ASC
  `;
  db.all(query, [classId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const posts = {};
    rows.forEach(row => {
      if (!posts[row.post_id]) posts[row.post_id] = { id: row.post_id, user_id: row.post_user_id, user_name: row.post_user_name, content: row.post_content, created_at: row.post_created_at, comments: [] };
      if (row.comment_id) posts[row.post_id].comments.push({ id: row.comment_id, user_id: row.comment_user_id, user_name: row.comment_user_name, content: row.comment_content, parent_comment_id: row.parent_comment_id, created_at: row.comment_created_at });
    });

    res.json(Object.values(posts));
  });
});

app.post('/api/class/:id/posts', (req, res) => {
  const classId = req.params.id;
  const { user_id, content } = req.body;
  db.run(`INSERT INTO post (class_id, user_id, content) VALUES (?,?,?)`, [classId, user_id, content], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, class_id: classId, user_id, content, comments: [] });
  });
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const { user_id, content, parent_comment_id = null } = req.body;
  db.run(`INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?,?,?,?)`, [postId, user_id, content, parent_comment_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, post_id: postId, user_id, content, parent_comment_id });
  });
});

// --------- ASSIGNMENTS ----------
// Teacher creates assignment
app.post('/api/class/:classId/assignments', upload.single('file'), (req, res) => {
  const classId = req.params.classId;
  const { title, description, due_date, points } = req.body;

  if (!title || !due_date) return res.status(400).json({ error: 'Missing required fields' });

  const filePath = req.file ? path.basename(req.file.path) : null;
  const pts = points ?? 0;

  db.run(
    `INSERT INTO assignments (title, description, due_date, points, class_id, file_path) VALUES (?,?,?,?,?,?)`,
    [title, description || null, due_date, pts, classId, filePath],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create assignment' });
      res.json({
        id: this.lastID,
        title,
        description: description || null,
        due_date,
        points: pts,
        class_id: Number(classId),
        file: filePath
      });
    }
  );
});

// List all assignments for a class
app.get('/api/class/:id/assignments', (req, res) => {
  const classId = req.params.id;
  db.all(
    `SELECT id, title, description, due_date AS dueDate, points, class_id AS classId, file_path AS filePath FROM assignments WHERE class_id=? ORDER BY id DESC`,
    [classId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch assignments' });
      res.json(rows);
    }
  );
});

// Student submits assignment
app.post('/api/assignments/:assignmentId/submit', upload.single('file'), (req, res) => {
  const assignmentId = req.params.assignmentId;
  const studentId = req.body.user_id || req.body.student_id;
  if (!studentId) return res.status(400).json({ error: 'Missing student_id' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = path.basename(req.file.path);

  db.get('SELECT id FROM assignments WHERE id = ?', [assignmentId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Assignment not found' });

    db.get('SELECT id FROM submission WHERE assignment_id = ? AND student_id = ?', [assignmentId, studentId], (sErr, sRow) => {
      if (sErr) return res.status(500).json({ error: 'DB error' });

      if (sRow) {
        db.run('UPDATE submission SET file_path = ?, status = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [filePath, 'submitted', sRow.id], function(uErr) {
          if (uErr) return res.status(500).json({ error: 'Failed to update submission' });
          res.json({ id: sRow.id, assignment_id: Number(assignmentId), student_id: Number(studentId), file: filePath, status: 'submitted' });
        });
      } else {
        db.run('INSERT INTO submission (assignment_id, student_id, file_path, status) VALUES (?,?,?,?)', [assignmentId, studentId, filePath, 'submitted'], function(iErr) {
          if (iErr) return res.status(500).json({ error: 'Failed to save submission' });
          res.json({ id: this.lastID, assignment_id: Number(assignmentId), student_id: Number(studentId), file: filePath, status: 'submitted' });
        });
      }
    });
  });
});

// Teacher views submissions
app.get('/api/assignments/:assignmentId/submissions', (req, res) => {
  const assignmentId = req.params.assignmentId;
  db.all(
    `SELECT s.id, s.assignment_id, s.student_id, s.file_path AS file, s.status, s.created_at,
            u.name AS student_name, u.email AS student_email
     FROM submission s
     LEFT JOIN users u ON s.student_id = u.id
     WHERE s.assignment_id = ?
     ORDER BY s.created_at DESC`,
    [assignmentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch submissions' });
      res.json(rows);
    }
  );
});

// Serve uploaded files for download
app.use('/uploads', express.static(uploadDir));

// Start server
app.listen(3001, () => console.log("Server running on http://localhost:3001"));
