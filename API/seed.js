// API/seed.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'classroom.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  const teacherEmail = 'seed_teacher@local';
  const studentEmail = 'seed_student@local';

  // ensure teacher exists
  db.get("SELECT id FROM users WHERE email = ?", [teacherEmail], (err, row) => {
    if (err) return console.error('Error checking teacher user:', err);
    const createTeacher = (cb) => {
      const hashed = bcrypt.hashSync('password', 10);
      db.run("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        ['Seed Teacher', teacherEmail, hashed, 'teacher'],
        function(e) {
          if (e) return console.error('Error inserting teacher:', e);
          console.log('Seed teacher created id=' + this.lastID);
          cb(this.lastID);
        });
    };

    const ensureClass = (teacherId) => {
      db.get("SELECT id FROM class WHERE name = ?", ['Sample Class'], (cErr, cRow) => {
        if (cErr) return console.error('Error checking class:', cErr);
        if (!cRow) {
          db.run("INSERT INTO class (name,description,teacher_id,class_code) VALUES (?,?,?,?)",
            ['Sample Class', 'A seeded sample class', teacherId, 'SAMPLE1'],
            function(ciErr) {
              if (ciErr) return console.error('Error inserting class:', ciErr);
              console.log('Seed class created id=' + this.lastID);
            });
        } else {
          console.log('Sample Class already exists (id=' + cRow.id + ')');
        }
      });
    };

    if (!row) {
      createTeacher((teacherId) => ensureClass(teacherId));
    } else {
      console.log('Teacher already exists (id=' + row.id + ')');
      ensureClass(row.id);
    }
  });

  // ensure student exists
  db.get("SELECT id FROM users WHERE email = ?", [studentEmail], (err2, sRow) => {
    if (err2) return console.error('Error checking student user:', err2);
    if (!sRow) {
      const hashed = bcrypt.hashSync('password', 10);
      db.run("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        ['Seed Student', studentEmail, hashed, 'student'],
        function(e) {
          if (e) return console.error('Error inserting student:', e);
          console.log('Seed student created id=' + this.lastID);
        });
    } else {
      console.log('Student already exists (id=' + sRow.id + ')');
    }
  });

});