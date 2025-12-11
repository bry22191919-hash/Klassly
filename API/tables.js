const sqlite3 = require ("sqlite3").verbose();

const db = new sqlite3.Database("./classroom.db");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS classes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        teacher_id INTEGER NOT NULL,
        class_code TEXT NOT NULL UNIQUE,
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
        FOREIGN KEY (class_id) REFERENCES classes(id)
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
        class_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS class_students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
        )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS comments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        parent_comment_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES post(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
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

// Migration: ensure `bio`, `notifications`, `privacy`, and `profilePicture` columns exist on users table
db.serialize(() => {
    db.all("PRAGMA table_info(users)", [], (err, rows) => {
        if (err) {
            console.error('Error reading users table info:', err);
            return;
        }

        const cols = rows.map(r => r.name);
        
        if (!cols.includes('bio')) {
            db.run("ALTER TABLE users ADD COLUMN bio TEXT", (aErr) => {
                if (aErr) console.error('Failed to add bio column to users:', aErr);
                else console.log('Added bio column to users table');
            });
        }

        if (!cols.includes('notifications')) {
            db.run("ALTER TABLE users ADD COLUMN notifications TEXT", (aErr) => {
                if (aErr) console.error('Failed to add notifications column to users:', aErr);
                else console.log('Added notifications column to users table');
            });
        }

        if (!cols.includes('privacy')) {
            db.run("ALTER TABLE users ADD COLUMN privacy TEXT", (aErr) => {
                if (aErr) console.error('Failed to add privacy column to users:', aErr);
                else console.log('Added privacy column to users table');
            });
        }

        if (!cols.includes('profilePicture')) {
            db.run("ALTER TABLE users ADD COLUMN profilePicture TEXT", (aErr) => {
                if (aErr) console.error('Failed to add profilePicture column to users:', aErr);
                else console.log('Added profilePicture column to users table');
            });
        }
    });
});

// Ensure profilePicture column has proper indexing for faster lookups
db.serialize(() => {
    db.all("PRAGMA index_list(users)", [], (err, indexes) => {
        if (err) {
            console.error('Error checking indexes:', err);
            return;
        }

        const hasProfilePictureIndex = indexes.some(index => index.name === 'idx_users_profilePicture');
        
        if (!hasProfilePictureIndex) {
            db.run("CREATE INDEX IF NOT EXISTS idx_users_profilePicture ON users(profilePicture)", (idxErr) => {
                if (idxErr) {
                    console.error('Failed to create profilePicture index:', idxErr);
                } else {
                    console.log('Created profilePicture index on users table');
                }
            });
        }
    });
});

// Add this export at the end:
module.exports = db;