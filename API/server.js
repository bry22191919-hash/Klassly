const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./tables");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());


// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

// Initialize multer
const upload = multer({ storage });

// Authentication Routes
app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).send('Fill out all requirements');
  }

  const hashed = bcrypt.hashSync(password, 10);
  const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;

  db.run(query, [name, email, hashed, role], function(err) {
    if (err) return res.status(400).json({ error: "Email already exists" });
    console.log("Registered successfully");
    res.json({
      message: "User successfully registered",
      user_id: this.lastID
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) return res.status(400).json({ error: "User not found" });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Wrong password" });
    }

    res.json({ message: "Login success", user });
  });
});


//home
app.get("/api/dashboard/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT
      classes.id,
      classes.name,
      classes.subject,
      classes.teacher_id,
      classes.class_code,
      u.name AS teacher_name
    FROM classes
    LEFT JOIN users u ON classes.teacher_id = u.id
    WHERE classes.teacher_id = ?
      OR classes.id IN (SELECT class_id FROM class_students WHERE student_id = ?)
  `;

  db.all(query, [userId, userId], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    console.log("Dashboard classes:", rows);
    res.json(rows || []);
  });
});


app.post("/api/create-classes", (req, res) => {
  const { name, subject, teacher_id, class_code } = req.body;

  const query = `INSERT INTO classes (name, subject, teacher_id, class_code) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, subject, teacher_id, class_code], function(err) {
    if (err) {
      console.error("SQLite Error:", err);
      return res.status(400).json({ error: "Something went wrong." });
    }
    console.log("Class created");
    res.json({
      message: "Class successfully created",
      class_id: this.lastID
    });
  });
});

//student joins class
app.post("/api/join-class", (req, res) => {
  const { class_code: rawClassCode, student_id } = req.body;
  const class_code = rawClassCode.trim(); 

  db.get(
    `SELECT * FROM classes WHERE UPPER(class_code) = UPPER(?)`, [class_code], (err, code) => {

      if (err) {
        console.error("Something went wrong:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!code) return res.status(400).json({ error: "Class Code ERROR!" });

      //insert student into class_students table
      const insertQuery = `INSERT INTO class_students (class_id, student_id) VALUES (?, ?)`;

      db.run(insertQuery, [code.id, student_id], function (err) {
        if (err) {
          console.error("Error joining class:", err);
          return res.status(400).json({ error: "Already joined or error occurred" });
        }

        res.json({ message: "Successfully joined class", class: code });
      });
    }
  );
});

// Get a single class by ID
app.get('/api/class/:id', (req, res) => {
  const classId = req.params.id;

  const query = `
    SELECT c.*, u.name as teacher_name
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
    WHERE c.id = ?
  `;

  db.get(query, [classId], (err, classInfo) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!classInfo) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(classInfo);
  });
});


app.get('/api/class/:id/members', (req, res) => {
  const classId = req.params.id;
  const query = `
    SELECT u.id AS user_id, u.name
    FROM class_students cs
    LEFT JOIN users u ON cs.student_id = u.id
    WHERE cs.class_id = ?
  `;
  db.all(query, [classId], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// Get all posts for a class with their comments
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
      if (!posts[row.post_id]) {
        posts[row.post_id] = {
          id: row.post_id,
          user_id: row.post_user_id,
          user_name: row.post_user_name,
          content: row.post_content,
          created_at: row.post_created_at,
          comments: []
        };
      }

      if (row.comment_id) {
        posts[row.post_id].comments.push({
          id: row.comment_id,
          user_id: row.comment_user_id,
          user_name: row.comment_user_name,
          content: row.comment_content,
          parent_comment_id: row.parent_comment_id,
          created_at: row.comment_created_at
        });
      }
    });

    res.json(Object.values(posts));
  });
});

// Create a new post
app.post('/api/class/:id/posts', (req, res) => {
  const classId = req.params.id;
  const { user_id, content } = req.body;

  db.run(
    `INSERT INTO post (class_id, user_id, content) VALUES (?, ?, ?)`,
    [classId, user_id, content],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        class_id: classId, 
        user_id, 
        content, 
        comments: [] 
      });
    }
  );
});

// Create a new comment (or reply)
app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const { user_id, content, parent_comment_id = null } = req.body;

  db.run(
    `INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)`,
    [postId, user_id, content, parent_comment_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        post_id: postId,
        user_id,
        content,
        parent_comment_id
      });
    }
  );
});




// Assignments Routes
// Create assignment (with optional file upload)
app.post('/api/assignments', upload.single('file'), (req, res) => {
  const { title, description, dueDate, points, classId } = req.body;

  if (!title || !description || !dueDate || !points || !classId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const filePath = req.file ? path.relative(process.cwd(), req.file.path) : null;

  const query = `INSERT INTO assignments (title, description, due_date, points, class_id, file_path) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [title, description, dueDate, points, classId, filePath], function(err) {
    if (err) {
      console.error('DB error inserting assignment:', err);
      return res.status(500).json({ error: 'Failed to create assignment' });
    }

    res.json({ message: 'Assignment created', id: this.lastID });
  });
});

// List all assignments
app.get('/api/assignments', (req, res) => {
  const query = `
    SELECT id, title, description, due_date AS dueDate, points, class_id AS classId, file_path AS filePath
    FROM assignments
    ORDER BY id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error fetching assignments:', err);
      return res.status(500).json({ error: 'Failed to fetch assignments' });
    }
    res.json(rows);
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3001, () => console.log("Running on http://localhost:3001"));
