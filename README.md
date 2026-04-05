# AI Resume Analyzer

Analyze your resume with AI, get an ATS compatibility score, find skill gaps, and follow a personalized learning plan to improve your candidacy.

## Why I Built This

Job applications are overwhelming. I wanted to help people understand what's actually holding their resume back. Most resume advice is vague ("use strong verbs!"). This tool gives specific, actionable feedback using AI analysis and actual job market data.

## Features

- **Resume Upload** - Upload PDF or Word documents for analysis
- **ATS Scoring** - Check how well your resume works with Applicant Tracking Systems  
- **AI Analysis** - Get feedback on content, tone, and technical depth using local LLM
- **Skill Matching** - Compare your resume against job descriptions to find gaps
- **Learning Paths** - Get personalized 2-week plans to develop missing skills
- **Analysis History** - Track your progress as you improve over time

## Tech Stack

**Frontend:** React, Tailwind CSS, Vite  
**Backend:** Node.js, Express, MongoDB  
**AI:** Ollama (local language model)  
**Other:** JWT authentication, Multer for file uploads

---

## How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/Samiksha-Lone/resume-analyzer.git
cd resume-analyzer
```

2. Set up backend:
```bash
cd backend
npm install
npm run dev
```

3. Set up frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

5. Start Ollama (in another terminal):
```bash
ollama serve
```

The app will run on `http://localhost:5173`

6. Create a `.env` file inside `backend/` with at least the following values:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/resume-analyzer
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=gpt-oss:120b-cloud
MAX_FILE_SIZE=10485760
```

---

## What I Learned

- **AI Integration** - Using local language models (Ollama) instead of expensive cloud APIs
- **NLP Algorithms** - Implementing semantic similarity and TF-IDF for skill matching
- **ATS Parsing** - Understanding how applicant tracking systems filter resumes
- **Full-Stack Development** - Building complete feature from file uploads to real-time analysis
- **Async Processing** - Handling long-running AI tasks without blocking the server
- **Database Design** - Structuring data for efficient storage and querying

---

## Future Improvements

- Real-time analysis updates with WebSockets
- Recruiter dashboard for screening candidates
- LinkedIn profile integration
- Video interview feedback

---

## License

This project is licensed under the ISC License.