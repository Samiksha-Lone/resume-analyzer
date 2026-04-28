# ScoreSync — AI-Powered Resume Optimization

> A professional full-stack MERN application that helps job seekers optimize their resumes with ATS scoring, skill gap analysis, and AI-powered recommendations.

## 🔗 Links
- **GitHub Repository**: [https://github.com/Samiksha-Lone/resume-analyzer](https://github.com/Samiksha-Lone/resume-analyzer)

## Overview

ScoreSync is an intelligent career growth platform designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS). By leveraging advanced AI models, it provides real-time scoring, deep skill analysis, and personalized learning roadmaps to help users navigate the modern hiring landscape.

## Problem Statement

- **Blind Applications**: Job seekers often apply to roles without knowing if their resumes can pass automated ATS filters.
- **Vague Feedback**: Standard resume reviews lack actionable, role-specific data on skill gaps.
- **Formatting Issues**: Improper resume structure can lead to data loss during parsing.
- **Lack of Direction**: Difficulty identifying exactly what to learn to improve candidacy for specific roles.

## Solution

ScoreSync solves these challenges by providing a comprehensive analysis engine that compares resumes against specific job descriptions. It offers a proprietary ATS compatibility score, detects technical depth through a "Reality Check" algorithm, and generates 2-week personalized learning roadmaps to help users bridge their skill gaps.

## Key Features

- 🤖 **AI-Powered Analysis** — High-fidelity resume evaluation using Ollama and Gemini LLM orchestration
- 🎯 **Resume-Job Matching** — Precise alignment check against specific target job descriptions
- 📊 **ATS Compatibility Score** — Real-time 0-100% scoring with actionable improvement feedback
- 🔍 **Reality Check** — Advanced detection of impact metrics, technical depth, and AI-generated tone
- 📚 **Learning Roadmaps** — 2-week personalized plans with targeted tasks to bridge skill gaps
- 💬 **Interview Preparation** — Role-specific mock questions with AI-suggested "Best Answers"
- 💾 **Branded PDF Export** — Download professionally formatted, ATS-optimized resumes with ScoreSync branding
- 🔄 **Analysis History** — Comprehensive tracking and side-by-side comparison of historical analyses
- 🌗 **Premium UI/UX** — Modern, high-performance interface with full Dark Mode support

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **AI & NLP** | Ollama LLM, Gemini API, Natural.js |
| **Document Gen** | jsPDF (Branded vector generation) |
| **Auth** | JWT, bcryptjs |

## Architecture / Flow

```text
User → React Frontend (Vite) → REST API → MongoDB Atlas
                                  ↓
                        AI Analysis Pipeline (Ollama/Gemini)
                        NLP Keyword Extraction & Scoring
                        Branded PDF Generation Service
```

## My Contribution

**I independently designed and built this entire project from scratch**, including:

- 🖥️ **Frontend** — All React components, routing, state management, and the responsive design system
- ⚙️ **Backend** — Scalable Express server, RESTful APIs, and complex MongoDB analysis schemas
- 🤖 **AI Integration** — Orchestration of multiple LLMs and the NLP-based scoring algorithms
- 📊 **Algorithm Development** — Designing the multi-layer ATS scoring and "Reality Check" engines
- 🔐 **Security & Auth** — Secure JWT authentication and data protection layers

## Setup

### Prerequisites
Node.js 18+, npm, MongoDB Atlas account, Ollama (optional for local LLM)

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URI=mongodb+srv://<your-cluster>
JWT_SECRET=your_secret_key
OLLAMA_BASE_URL=http://localhost:11434
GEMINI_API_KEY=your_gemini_key
API_URL=http://localhost:3000
```

```bash
npm run dev   # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
VITE_API_BASE=http://localhost:3000/api
```

```bash
npm run dev   # http://localhost:5173
```

## Screenshots

### Landing Page
![Landing Page](outputs/home.webp)

### User Dashboard
![User Dashboard](outputs/dashboard.webp)

### Analysis Results
![Analysis Results](outputs/result.webp)

## Future Improvements

- [ ] Browser extension for real-time analysis of job postings on LinkedIn and Indeed
- [ ] Collaborative resume review feature for peer and mentor feedback
- [ ] Integration with Job Boards for one-click optimized applications

## License

ISC License — see [LICENSE](LICENSE) for details.

## Credits

**Developed by [Samiksha Lone](https://github.com/Samiksha-Lone)**