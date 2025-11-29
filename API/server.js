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

// ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

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

app.post("/api/register", (req, res) => {
  const  {name, email, password, role} = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  if (!name ||!email || !password ||!role ){
    return res.status(400).send('Fill out all requirements');
  }

  const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, email, hashed, role], function(err) {
    if(err) return res.status(400).json({error: "email already exists"});
    console.log("Registered successfully");
    res.json({
      message: "User successfully registered",
      user_id: this.lastId
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Wrong password" });
    }

    res.json({ message: "Login success", user });
  });
});


// Create assignment endpoint (multipart/form-data with optional file)
app.post('/api/assignments', upload.single('file'), (req, res) => {
  const { title, description, dueDate, points, classId } = req.body;
  if (!title || !description || !dueDate || !points || !classId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const filePath = req.file ? path.relative(process.cwd(), req.file.path) : null;

  const query = `INSERT INTO assignments (title, description, due_date, points, class_id, file_path) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [title, description, dueDate, points, classId, filePath], function (err) {
    if (err) {
      console.error('DB error inserting assignment:', err);
      return res.status(500).json({ error: 'Failed to create assignment' });
    }

    res.json({ message: 'Assignment created', id: this.lastID });
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// List assignments (GET) so the endpoint can be visited from a browser
app.get('/api/assignments', (req, res) => {
  const query = `SELECT id, title, description, due_date as dueDate, points, class_id as classId, file_path as filePath FROM assignments ORDER BY id DESC`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error fetching assignments:', err);
      return res.status(500).json({ error: 'Failed to fetch assignments' });
    }
    res.json(rows);
  });
});

// List all classes
app.get('/api/classes', (req, res) => {
  const query = `SELECT id, name, description, teacher_id as teacherId, class_code as classCode FROM class ORDER BY id ASC`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('DB error fetching classes:', err);
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }
    res.json(rows);
  });
});

// Create submission endpoint (multipart/form-data with optional file and text)
app.post('/api/submissions', upload.single('file'), (req, res) => {
  const { assignmentId, studentId, text } = req.body;
  if (!assignmentId || !studentId) {
    return res.status(400).json({ error: 'Missing required fields: assignmentId and studentId' });
  }

  const filePath = req.file ? path.relative(process.cwd(), req.file.path) : null;
  const status = 'submitted';
  const createdAt = new Date().toISOString();

  const query = `INSERT INTO submission (assignment_id, student_id, file_path, status, text, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [assignmentId, studentId, filePath, status, text || null, createdAt], function (err) {
    if (err) {
      console.error('DB error inserting submission:', err);
      return res.status(500).json({ error: 'Failed to create submission' });
    }
    res.json({ message: 'Submission created', id: this.lastID });
  });
});

// List submissions (optionally filter by assignmentId)
app.get('/api/submissions', (req, res) => {
  const { assignmentId } = req.query;
  let query = `SELECT id, assignment_id as assignmentId, student_id as studentId, file_path as filePath, status, text, created_at as createdAt FROM submission`;
  const params = [];
  if (assignmentId) {
    query += ` WHERE assignment_id = ?`;
    params.push(assignmentId);
  }
  query += ` ORDER BY id DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('DB error fetching submissions:', err);
      return res.status(500).json({ error: 'Failed to fetch submissions' });
    }
    res.json(rows);
  });
});

  // Join class endpoint - student joins a class
  app.post('/api/join-class', (req, res) => {
    const { classId, studentId } = req.body;
    if (!classId || !studentId) return res.status(400).json({ error: 'Missing classId or studentId' });

    // Check if class exists
    db.get('SELECT id FROM class WHERE id = ?', [classId], (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!row) return res.status(404).json({ error: 'Class not found' });

      // Check if already joined
      db.get('SELECT id FROM class_students WHERE class_id = ? AND student_id = ?', [classId, studentId], (e2, existing) => {
        if (e2) return res.status(500).json({ error: 'DB error' });
        if (existing) return res.status(400).json({ error: 'Already joined' });

        db.run('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)', [classId, studentId], function (e3) {
          if (e3) return res.status(500).json({ error: 'Failed to join class' });
          res.json({ message: 'Joined class', id: this.lastID });
        });
      });
    });
  });




app.listen(3001, () => console.log("Running on http://localhost:3001"));
