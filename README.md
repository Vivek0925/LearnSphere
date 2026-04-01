# 🌐 LearnSphere — AI-Powered Adaptive Learning Platform

An intelligent, adaptive learning platform for engineering students featuring PYQ analysis, personalized recommendations, and an AI chatbot tutor.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## 📦 Installation

### 1. Clone & Setup

```bash
cd LearnSphere
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/learnsphere
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev     # Development (with nodemon)
npm start       # Production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🏗 Project Structure

```
LearnSphere/
├── backend/
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── subjectController.js
│   │   ├── pyqController.js
│   │   ├── progressController.js
│   │   ├── chatbotController.js
│   │   ├── notesController.js
│   │   └── videosController.js
│   ├── models/            # MongoDB Schemas
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── PYQ.js
│   │   ├── Progress.js
│   │   ├── Note.js
│   │   └── Video.js
│   ├── routes/            # API Routes
│   │   ├── auth.js
│   │   ├── subjects.js
│   │   ├── pyq.js
│   │   ├── progress.js
│   │   ├── chatbot.js
│   │   ├── notes.js
│   │   └── videos.js
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── data/
│   │   └── seed.js        # Sample data seeder
│   ├── uploads/           # PDF uploads (auto-created)
│   ├── server.js
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── common/    # Reusable UI components
│       │   ├── layout/    # Navbar, Sidebar, Layout
│       │   └── chatbot/   # AI Chatbot Widget
│       ├── pages/         # Route pages
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── SubjectsPage.jsx
│       │   ├── SubjectDetailPage.jsx
│       │   ├── PYQPage.jsx
│       │   ├── NotesPage.jsx
│       │   ├── VideosPage.jsx
│       │   └── ProgressPage.jsx
│       ├── context/       # React Context
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── hooks/         # Custom hooks
│       │   └── useSubjects.js
│       ├── services/      # API services
│       │   ├── api.js
│       │   └── index.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/subjects/:id` | Get subject by ID |
| GET | `/api/subjects/code/:code` | Get by code |

### PYQ
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pyq` | Get all PYQs |
| POST | `/api/pyq/upload` | Upload PYQ (auth) |
| GET | `/api/pyq/subject/:id` | Get by subject |
| GET | `/api/pyq/:id` | Get single PYQ |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get user progress |
| GET | `/api/progress/:subjectId` | Subject progress |
| POST | `/api/progress/update` | Update progress |
| GET | `/api/progress/recommendations` | Priority recommendations |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send message |

### Notes & Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get notes (search params) |
| GET | `/api/notes/subject/:name` | Notes by subject |
| GET | `/api/videos` | Get videos |
| GET | `/api/videos/subject/:name` | Videos by subject |

---

## ✨ Features

### 🎯 Core Features
- **Authentication** — JWT-based login/register with protected routes
- **Dashboard** — Personalized overview with progress, recommendations, and stats
- **Subjects** — 6 Engineering subjects with topic-level data
- **PYQ Upload** — PDF upload with simulated extraction and AI analysis
- **PYQ Analysis** — Topic importance scores, trend indicators
- **Adaptive Learning** — Track accuracy, attempts, mastery per topic
- **Priority Recommendations** — Combined importance + weakness scoring
- **AI Chatbot** — Context-aware tutoring for topics, PYQ trends, notes
- **Notes** — Searchable, filterable topic-wise notes with key points
- **Smart Videos** — YouTube videos with clickable smart timestamps

### 🎨 UI Features
- **Glassmorphism** design with blur + transparency
- **Light/Dark mode** toggle with smooth transitions
- **Framer Motion** animations throughout
- **Responsive** layout for mobile + desktop
- **Radar chart** for subject mastery visualization
- **Progress bars** for mastery levels

---

## 🔧 Customization

### Adding Subjects
Edit `backend/data/seed.js` and add to the `subjects` array.

### Connecting Real LLM (Chatbot)
In `backend/controllers/chatbotController.js`, replace the mock `findAnswer()` logic with an API call to OpenAI, Anthropic, or any LLM provider.

### Real PDF Extraction
Replace the `extractQuestionsFromPDF()` mock in `pyqController.js` with a real PDF parser like `pdf-parse` or `pdfjs-dist`.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## 📝 Demo Credentials

After seeding the database, register any account via the signup page.
Or use the **"Try Demo Account"** button on the login page (requires a seeded demo user).

---

## 📄 License

MIT — built as an MVP for educational purposes.
