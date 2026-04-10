# Resume Analyzer

AI-powered resume analysis tool that evaluates resumes against job descriptions, provides ATS compatibility scores, and generates personalized learning roadmaps to improve candidacy.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **GitHub Repository**: [https://github.com/Samiksha-Lone/resume-analyzer](https://github.com/Samiksha-Lone/resume-analyzer)

## 📋 Problem Statement

In today's competitive job market, job seekers struggle with optimizing resumes due to generic advice, ATS compatibility issues, unidentified skill gaps, and lack of progress tracking, leading to wasted applications and missed opportunities.

## 🗺️ Problem–Solution Mapping

The Resume Analyzer addresses these challenges by providing AI-powered specific feedback on content and tone, automated ATS scoring, resume-job description matching with gap identification, analysis history for progress tracking, and AI-generated learning roadmaps for personalized improvement plans.

## 🏗️ System Architecture

- **Frontend**: React-based responsive interface for uploads and results visualization
- **Backend**: Node.js/Express API handling file processing, AI analysis, and database operations
- **Database**: MongoDB for storing user data, resumes, and analysis history
- **Authentication**: JWT-based secure user management
- **AI Integration**: Local Ollama models with cloud OpenAI fallback for privacy and scalability

## ✨ Features

- Resume upload support for PDF and DOCX formats
- AI-powered content and tone analysis
- Skill matching against job descriptions
- ATS compatibility scoring
- Progress tracking with historical analysis
- Personalized learning roadmaps
- Secure user authentication
- Responsive mobile-friendly design

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcrypt
- **AI**: AI Integration, pdf-parse, mammoth

## 🚀 Installation / Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Ollama (for AI analysis)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### AI Setup
Choose your AI provider:

**For Local AI (Ollama - Default):**
```bash
# Install and start Ollama
ollama serve

# Pull a model
ollama pull llama2
```

**For Cloud AI (OpenAI - Production):**
```bash
# Get API key from https://platform.openai.com/api-keys
# Add OPENAI_API_KEY to your .env file
# Set AI_PROVIDER=openai in .env
```

### Environment Configuration
Create `.env` file in backend directory:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/resume-analyzer
JWT_SECRET=your-secret-key
MAX_FILE_SIZE=10485760

# AI Configuration (choose one)
AI_PROVIDER=ollama  # or 'openai' for production

# Ollama (local AI - default)
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=llama2

# OpenAI (cloud AI - production)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

## 📸 Screenshots

![Home](outputs/home.webp)

![Dashboard](outputs/dashboard.webp)

![Analysis](outputs/result.webp)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Credit

If you use or build upon this project, please provide attribution:  
Samiksha Lone  
https://github.com/Samiksha-Lone