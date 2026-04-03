# Resume Analyzer

A comprehensive full-stack application that analyzes resumes, performs ATS matching, and provides AI-powered insights for job seekers and recruiters.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [License](#license)

## ✨ Features

### Resume Analysis
- **PDF & Document Parsing**: Support for PDF, DOCX, and other document formats
- **Data Extraction**: Automatically extracts skills, experience, education, and contact information
- **AI-Powered Insights**: Uses local AI (Ollama) for intelligent analysis and recommendations

### ATS Matching
- **Job Description Matching**: Compares resumes against job descriptions
- **Match Score Calculation**: Provides detailed matching percentages
- **Optimization Suggestions**: AI-generated feedback for resume improvement

### User Management
- **JWT Authentication**: Secure user registration and login
- **Password Security**: Bcrypt password hashing
- **Profile Management**: User account management and history tracking

### Additional Features
- **Resume Editor**: Built-in resume editor for quick modifications
- **GitHub Integration**: Connect and analyze GitHub profiles
- **Cloud Storage**: ImageKit integration for file management
- **Learning Roadmap**: Personalized learning recommendations
- **Dark/Light Theme**: Theme switching capabilities

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken) + Bcrypt
- **File Processing**: 
  - Multer (file uploads)
  - PDF-Parse (PDF extraction)
  - Mammoth (DOCX extraction)
- **AI**: Ollama (local AI inference)
- **Storage**: ImageKit
- **HTTP Client**: Axios

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **UI Components**: Custom + Lucide Icons
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 📦 Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: v4.4 or higher (local or cloud instance)
- **Ollama**: Latest version (for local AI functionality)
- **ImageKit Account**: For media storage (optional)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resume-analyzer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/resume-analyzer

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# ImageKit (Optional)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_token
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Running the Application

### Development Mode

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Terminal 2 - Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available on `http://localhost:5173`

### Production Mode

#### Build Backend
```bash
cd backend
npm run start
```

#### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
resume-analyzer/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app configuration
│   │   ├── config/               # Configuration files
│   │   │   └── db.js             # Database connection
│   │   ├── controllers/          # Request handlers
│   │   │   ├── analysis.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── match.controller.js
│   │   │   └── resume.controller.js
│   │   ├── middlewares/          # Custom middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models/               # Database schemas
│   │   │   ├── resume.model.js
│   │   │   └── user.model.js
│   │   ├── routes/               # API routes
│   │   │   ├── auth.routes.js
│   │   │   └── resume.routes.js
│   │   ├── services/             # Business logic
│   │   │   ├── ai.service.js
│   │   │   ├── ats.service.js
│   │   │   ├── extraction.service.js
│   │   │   ├── github.service.js
│   │   │   ├── match.service.js
│   │   │   ├── resume.service.js
│   │   │   └── storage.service.js
│   │   └── utils/                # Utility functions
│   │       ├── apiResponse.js
│   │       ├── logger.js
│   │       └── queue.js
│   ├── uploads/                  # Uploaded resumes storage
│   ├── server.js                 # Entry point
│   ├── package.json
│   └── .env                      # Environment variables (create this)
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/              # React context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ResumeContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/                # Page components
│   │   ├── utils/                # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/                   # Static assets
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env                      # Environment variables (create this)
│
├── .gitignore
├── README.md
└── .git/
```

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Resume Endpoints
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume/:id` - Get resume details
- `DELETE /api/resume/:id` - Delete resume
- `GET /api/resume` - List all user resumes

### Analysis Endpoints
- `POST /api/analyze` - Analyze resume with AI
- `GET /api/analysis/:id` - Get analysis results

### Matching Endpoints
- `POST /api/match` - Match resume against job description
- `GET /api/match/:id` - Get match results

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Last Updated**: April 2026
