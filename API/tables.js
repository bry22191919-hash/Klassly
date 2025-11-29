const sqlite3 = require ("sqlite3").verbose();

const db = new sqlite3.Database("./classroom.db");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXt,
        role TEXT
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS class(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        teacher_id INTEGER,
        class_code TEXT,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS assignments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        due_date TEXT,
        points INTEGER DEFAULT 0,
        class_id INTEGER,
        file_path TEXT,
        FOREIGN KEY (class_id) REFERENCES class(id)
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS submission(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER,
        student_id INTEGER,
        file_path TEXT,
        status TEXT,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id)
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS post(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        user_id INTEGER,
        content TEXT,
        FOREIGN KEY (class_id) REFERENCES class(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS class_students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        student_id INTEGER,
        FOREIGN KEY (class_id) REFERENCES class(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
        )`)
});

// Migration: ensure `points` and `file_path` columns exist on assignments table
db.serialize(() => {
    db.all("PRAGMA table_info(assignments)", [], (err, rows) => {
        if (err) {
            console.error('Error reading assignments table info:', err);
            return;
        }

        const cols = rows.map(r => r.name);
        if (!cols.includes('points')) {
            db.run("ALTER TABLE assignments ADD COLUMN points INTEGER DEFAULT 0", (aErr) => {
                if (aErr) console.error('Failed to add points column to assignments:', aErr);
                else console.log('Added points column to assignments table');
            });
        }

        if (!cols.includes('file_path')) {
            db.run("ALTER TABLE assignments ADD COLUMN file_path TEXT", (aErr) => {
                if (aErr) console.error('Failed to add file_path column to assignments:', aErr);
                else console.log('Added file_path column to assignments table');
            });
        }
    });
});

// Migration: ensure `text` and `created_at` columns exist on submission table
db.serialize(() => {
    db.all("PRAGMA table_info(submission)", [], (err, rows) => {
        if (err) {
            console.error('Error reading submission table info:', err);
            return;
        }
        const cols = rows.map(r => r.name);
        if (!cols.includes('text')) {
            db.run("ALTER TABLE submission ADD COLUMN text TEXT", (aErr) => {
                if (aErr) console.error('Failed to add text column to submission:', aErr);
                else console.log('Added text column to submission table');
            });
        }
        if (!cols.includes('created_at')) {
            db.run("ALTER TABLE submission ADD COLUMN created_at TEXT", (aErr) => {
                if (aErr) console.error('Failed to add created_at column to submission:', aErr);
                else console.log('Added created_at column to submission table');
            });
        }
    });
});

module.exports = db; 