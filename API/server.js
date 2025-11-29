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

// =====================
// Uploads configuration
// =====================

// Create uploads folder if it does NOT exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure how multer stores uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // save uploaded files to uploads/
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname); // unique filename
  }
});

// Initialize multer upload handler
const upload = multer({ storage });

// Authentication Routes
//register user
app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;

  // Check missing fields
  if (!name || !email || !password || !role) {
    return res.status(400).send('Fill out all requirements');
  }

  //Encrypt password
  const hashed = bcrypt.hashSync(password, 10);

  //insert into db
  const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, email, hashed, role], function(err) {
    if (err) return res.status(400).json({ error: "Email already exists" });

    res.json({
      message: "User successfully registered",
      user_id: this.lastID // return generated user ID
    });
  });
});

//login user
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  //fetch user by email
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {

    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) return res.status(400).json({ error: "User not found" });

    // Compare password hashes
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Wrong password" });
    }

    res.json({ message: "Login success", user });
  });
});


//get dashboard classes for logged in user
app.get("/api/dashboard/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT * FROM classes
    WHERE teacher_id = ?                   
    OR id IN (
      SELECT class_id 
      FROM class_students 
      WHERE student_id = ?           
    )
  `;

  db.all(query, [userId, userId], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows); // return classes
  });
});

//teacher creates a class
app.post("/api/create-classes", (req, res) => {
  const { name, subject, teacher_id, class_code } = req.body;

  const query = `INSERT INTO classes (name, subject, teacher_id, class_code) VALUES (?, ?, ?, ?)`;

  db.run(query, [name, subject, teacher_id, class_code], function(err) {
    if (err) {
      console.error("SQLite Error:", err);
      return res.status(400).json({ error: "Something went wrong." });
    }

    res.json({
      message: "Class successfully created",
      class_id: this.lastID
    });
  });
});

//student joins a class using class code
app.post("/api/join-class", (req, res) => {
  const { class_code } = req.body;

  db.get(`SELECT * FROM classes WHERE class_code = ?`, [class_code], (err, code) => {

    if (err) {
      console.error("Something went wrong:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!code) return res.status(400).json({ error: "Class Code ERROR!" });

    res.json({ message: "Welcome", class: code });
  });
});


// Assignments Route
// Create assignment (file optional)
app.post('/api/assignments', upload.single('file'), (req, res) => {
  const { title, description, dueDate, points, classId } = req.body;

  // Validate inputs
  if (!title || !description || !dueDate || !points || !classId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Save file path if there is an upload
  const filePath = req.file ? path.relative(process.cwd(), req.file.path) : null;

  const query = `
    INSERT INTO assignments (title, description, due_date, points, class_id, file_path)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, description, dueDate, points, classId, filePath], function(err) {
    if (err) {
      console.error('DB error inserting assignment:', err);
      return res.status(500).json({ error: 'Failed to create assignment' });
    }

    res.json({ message: 'Assignment created', id: this.lastID });
  });
});

// List assignments
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

// Serve uploaded files (so frontend can access them)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(3001, () => console.log("Running on http://localhost:3001"));
