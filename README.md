# Klassly - Classroom Management System

A modern, full-stack classroom management web application built with React and Node.js. Klassly enables teachers to create and manage classes, assignments, and announcements while providing students with a streamlined interface to join classes and submit their work.

---

## Features

### Authentication & Security
- Secure user registration with role selection (Teacher/Student)
- Password hashing using bcrypt
- Session-based authentication with cookies
- IP-based rate limiting with escalating ban times (30s, 1m, 2m, 10m, 24h)
- Password strength indicator with real-time feedback and glowing visual bars
- Logout confirmation dialog ("Are you sure you want to logout?" with Yes/Cancel buttons)
- Profile avatars with image upload support

### Teacher Features
- **Class Management**: Create, edit, and delete classes with unique 6-character codes
- **Student Management**: View enrolled students with avatars, remove students from classes
- **Assignment Management**: 
  - Create assignments with titles, descriptions, and due dates
  - Schedule assignments for future posting
  - Set point values for assignments
  - Track submission status (Submitted, Not Submitted, Assigned)
  - View and download student submissions with submission time and file details
- **Announcements**: Post class announcements with optional titles
- **Comment Moderation**: Approve or delete student comments on announcements

### Student Features
- **Join Classes**: Enter class codes to join teacher's classes
- **View Assignments**: See all assignments with due dates and submission status
- **Submit Work**: Upload files (PDF, DOC, images) or submit text-based assignments
- **Update Submissions**: Modify previously submitted work
- **View Announcements**: Read class announcements from teachers
- **Comment on Posts**: Comment on announcements (requires teacher approval)
- **To-Do List**: Personal task management with add, complete, and delete functionality
- **View Members**: See all class members with their profile avatars

### UI/UX Features
- Modern, responsive design with smooth animations
- Loading spinners and skeleton loaders
- Scroll animations using Intersection Observer
- Toast notifications for user feedback
- Professional color scheme with consistent styling
- Mobile-friendly navigation
- Dark/Light theme toggle

---

## Project Structure

\`\`\`
├── API/                          # Backend
│   ├── server.js                 # Express server with all API routes
│   ├── tables.js                 # SQLite database schema initialization
│   ├── package.json              # Backend dependencies
│   └── klassly.db                # SQLite database (auto-generated)
│
├── Klassly/                      # Frontend
│   ├── src/
│   │   ├── Components/
│   │   │   ├── AssignmentForm.jsx      # Create assignment modal
│   │   │   ├── AssignmentModal.jsx     # View assignment details & submissions
│   │   │   ├── AssignmentsContainer.jsx # Assignment list with status
│   │   │   ├── ClassCards.jsx          # Class card grid display
│   │   │   ├── CommentsSection.jsx     # Comments with moderation
│   │   │   ├── CreatePostForm.jsx      # Create announcement form
│   │   │   ├── LoadingSpinner.jsx      # Loading indicator
│   │   │   ├── LogoutDialog.jsx        # Logout confirmation dialog
│   │   │   ├── MainLayout.jsx          # App layout with sidebar
│   │   │   ├── Notification.jsx        # Toast notifications
│   │   │   ├── PasswordStrength.jsx    # Password strength indicator
│   │   │   ├── PostCard.jsx            # Announcement card
│   │   │   ├── PostFeed.jsx            # Announcement feed
│   │   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   │   ├── SubmissionModal.jsx     # Submit assignment modal
│   │   │   ├── TodoList.jsx            # Personal to-do list
│   │   │   └── ViewMembers.jsx         # Class members list with avatars
│   │   │
│   │   ├── Pages/
│   │   │   ├── ClassPage.jsx           # Class view with tabs
│   │   │   ├── ClassSettingsPage.jsx   # Class settings (teacher)
│   │   │   ├── CreateClass.jsx         # Create new class
│   │   │   ├── Dashboard.jsx           # Main dashboard
│   │   │   ├── JoinClass.jsx           # Join class with code
│   │   │   ├── Landing.jsx             # Landing page
│   │   │   ├── LogIn.jsx               # Sign in page
│   │   │   ├── ProfilePage.jsx         # User profile with avatar
│   │   │   ├── SettingsPage.jsx        # Change password
│   │   │   └── SignUp.jsx              # Sign up page
│   │   │
│   │   ├── Context/
│   │   │   └── AuthContext.jsx         # Authentication context
│   │   │
│   │   ├── App.jsx                     # Main app with routes
│   │   ├── App.css                     # Component styles
│   │   ├── index.css                   # Global styles & CSS variables
│   │   └── main.jsx                    # React entry point
│   │
│   ├── index.html                      # HTML template
│   ├── package.json                    # Frontend dependencies
│   └── vite.config.js                  # Vite configuration with proxy
│
├── uploads/                            # Uploaded files storage
│   ├── avatars/                        # Profile avatar images
│   └── submissions/                    # Assignment submissions
│
└── README.md                           # This file
\`\`\`

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step 1: Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/klassly.git
cd klassly
\`\`\`

### Step 2: Install Backend Dependencies
\`\`\`bash
cd API
npm install
\`\`\`

### Step 3: Install Frontend Dependencies
\`\`\`bash
cd ../Klassly
npm install
\`\`\`

### Step 4: Run the Backend Server
\`\`\`bash
cd ../API
node server.js
\`\`\`
The backend will start on `http://localhost:5000`

### Step 5: Run the Frontend (in a new terminal)
\`\`\`bash
cd Klassly
npm run dev
\`\`\`
The frontend will start on `http://localhost:5173`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login user |
| POST | `/api/auth/signout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile (name, avatar, theme) |
| PUT | `/api/auth/password` | Change password |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | Get all classes for current user |
| POST | `/api/classes` | Create new class |
| GET | `/api/classes/:id` | Get class by ID |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |
| POST | `/api/classes/join` | Join class with code |
| POST | `/api/classes/:id/leave` | Leave class (student) |
| GET | `/api/classes/:id/members` | Get class members with avatars |
| DELETE | `/api/classes/:classId/students/:studentId` | Remove student |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments/:classId` | Get class assignments |
| GET | `/api/assignments/upcoming` | Get upcoming assignments (student) |
| POST | `/api/assignments/:classId` | Create assignment |
| PUT | `/api/assignments/:id` | Update assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |
| GET | `/api/assignments/:id/submissions` | Get all submissions for an assignment |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions/:assignmentId` | Submit assignment (with file upload) |
| PUT | `/api/submissions/:id` | Update submission |
| GET | `/api/submissions/:assignmentId/mine` | Get current user's submission |
| PUT | `/api/submissions/:id/grade` | Grade submission (teacher) |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements/:classId` | Get announcements |
| POST | `/api/announcements/:classId` | Create announcement |
| DELETE | `/api/announcements/:id` | Delete announcement |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:announcementId` | Get comments |
| POST | `/api/comments/:announcementId` | Add comment |
| PUT | `/api/comments/:id/approve` | Approve comment (teacher) |
| DELETE | `/api/comments/:id` | Delete comment |

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get user's todos |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |

---

## Database Schema

### Users
- `id` (INTEGER PRIMARY KEY)
- `email` (TEXT UNIQUE)
- `password` (TEXT) - bcrypt hashed
- `name` (TEXT)
- `role` (TEXT) - 'teacher' or 'student'
- `avatar` (TEXT) - path to avatar image
- `theme` (TEXT) - 'light' or 'dark'
- `created_at` (DATETIME)

### Classes
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `description` (TEXT)
- `code` (TEXT UNIQUE) - 6 character join code
- `teacher_id` (INTEGER FK)
- `color` (TEXT) - UI accent color
- `created_at` (DATETIME)

### Class_Students
- `id` (INTEGER PRIMARY KEY)
- `class_id` (INTEGER FK)
- `student_id` (INTEGER FK)
- `joined_at` (DATETIME)

### Assignments
- `id` (INTEGER PRIMARY KEY)
- `class_id` (INTEGER FK)
- `title` (TEXT)
- `description` (TEXT)
- `due_date` (DATETIME)
- `scheduled_date` (DATETIME) - for scheduled posting
- `points` (INTEGER)
- `created_at` (DATETIME)

### Submissions
- `id` (INTEGER PRIMARY KEY)
- `assignment_id` (INTEGER FK)
- `student_id` (INTEGER FK)
- `content` (TEXT) - text submission
- `file_path` (TEXT) - uploaded file path
- `file_name` (TEXT) - original file name
- `submitted_at` (DATETIME)
- `grade` (INTEGER)

### Announcements
- `id` (INTEGER PRIMARY KEY)
- `class_id` (INTEGER FK)
- `teacher_id` (INTEGER FK)
- `title` (TEXT)
- `content` (TEXT)
- `created_at` (DATETIME)

### Comments
- `id` (INTEGER PRIMARY KEY)
- `announcement_id` (INTEGER FK)
- `user_id` (INTEGER FK)
- `content` (TEXT)
- `approved` (INTEGER) - requires teacher approval (0 or 1)
- `created_at` (DATETIME)

### Todos
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER FK)
- `title` (TEXT)
- `completed` (INTEGER) - 0 or 1
- `created_at` (DATETIME)

---

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **Rate Limiting**: Progressive ban system for failed login attempts
   - 3 failures: 30 second ban
   - 6 failures: 1 minute ban
   - 9 failures: 2 minute ban
   - 12 failures: 10 minute ban
   - 15+ failures: 24 hour ban
3. **Input Validation**: All inputs are validated server-side
4. **Session Management**: Secure cookie-based sessions (7-day expiry)
5. **File Upload Security**: File type and size validation (10MB max)
6. **Comment Moderation**: Student comments require teacher approval

---

## Technologies Used

### Frontend
- React 18
- React Router DOM v6
- Vite (build tool)
- Lucide React (icons)
- CSS3 with custom properties

### Backend
- Node.js
- Express.js
- SQLite3 (better-sqlite3)
- bcrypt (password hashing)
- multer (file uploads)
- cookie-parser
- cors

---

## File Storage

Uploaded files are stored locally in the `/uploads` directory at the project root:
- `/uploads/avatars/` - Profile avatar images
- `/uploads/submissions/` - Student assignment submissions (PDF, DOC, DOCX, images)

Files are named with unique timestamps to prevent conflicts.

---

## License

This project is licensed under the MIT License.

---

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
