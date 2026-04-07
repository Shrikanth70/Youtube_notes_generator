# YT Notes AI - YouTube Notes Generator

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.115.x-009688?style=flat&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/License-MIT-FF5733" alt="License">
</p>

AI-powered full-stack application that converts YouTube videos into structured, study-ready markdown notes using agentic AI.

---

## Overview

YT Notes AI solves the problem of time-consuming manual note-taking from YouTube videos. The application extracts video transcripts and processes them through an AI agent pipeline to generate comprehensive, educational markdown notes.

### Key Benefits

- **Automated Note-Taking**: Converts any YouTube video into structured notes in seconds
- **AI-Powered Processing**: Uses agentic AI to clean, segment, and summarize content intelligently
- **User Management**: Secure authentication and personal note storage via Supabase
- **Usage Controls**: Built-in quota management for free and premium users

---

## Features

- **Multi-Format Support**: Works with standard YouTube URLs, Shorts, and Embeds
- **Agentic AI Pipeline**: Powered by CrewAI for sophisticated task orchestration
- **Structured Output**: Generates notes with title, overview, key concepts, steps, examples, takeaways, and glossary
- **Content Cleaning**: Removes filler words, repetitions, and ads automatically
- **User Authentication**: Email/password and Google OAuth via Supabase
- **Notes Management**: Save, view, search, and delete notes per user
- **Export Options**: Copy to clipboard and download as Markdown file
- **Usage Quotas**: Daily/monthly limits with premium tier support
- **Admin Dashboard**: System control for administrators

---

## Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS 4** for styling
- **Supabase JS Client** for authentication and database
- **React Router DOM** for navigation
- **React Markdown** with remark-gfm for rendering

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** for ORM
- **Supabase PostgreSQL** for database
- **youtube-transcript-api** for transcript extraction
- **CrewAI** for AI agent orchestration
- **OpenRouter** for LLM access

---

## Project Structure

```
youtube_notes_generator/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React contexts (Auth)
│   │   ├── views/              # Page components
│   │   ├── lib/                 # Utilities (Supabase client)
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── api/                 # API routes
│   │   ├── core/                # Core utilities
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── main.py              # FastAPI app
│   └── requirements.txt
│
├── .env                         # Environment variables (not tracked)
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account

### Clone & Setup

```bash
git clone https://github.com/Shrikanth70/YT-Notes-AI.git
cd YT-Notes-AI
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## Environment Variables

Create `.env` in `backend/`:
```env
DATABASE_URL=postgresql://user:password@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENROUTER_API_KEY=sk-or-v1-xxxx
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
CORS_ORIGINS=http://localhost:5173
```

Create `.env` in `frontend/`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

---

## Usage

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## API Endpoints

- `POST /api/notes` - Generate new notes
- `GET /api/notes` - List user notes
- `GET /api/notes/{id}` - Get specific note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/profile` - Get user profile

---

## License

MIT License
