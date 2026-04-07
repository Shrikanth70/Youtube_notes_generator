

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 🚀 AI YouTube Notes Generator (Full-Stack SaaS)

---

# 1. 📌 PRODUCT OVERVIEW

## 🧠 Product Name

**AI YouTube Notes Generator**

## 🎯 Vision

Transform passive video consumption into **structured, actionable learning** using AI-powered note generation.

## 💡 Problem Statement

Users face:

* time-consuming note-taking
* noisy transcripts
* unstructured summaries
* poor retention

## ✅ Solution

A full-stack SaaS platform that:

* extracts transcripts
* processes via AI agents
* generates structured markdown notes
* stores, manages, and retrieves notes per user

---

# 2. 🎯 PRODUCT GOALS

## Primary Goals

* Generate structured notes in < 20 seconds
* Support multiple YouTube formats
* Enable user-specific note storage
* Provide clean UX with minimal friction

## Secondary Goals

* Build scalable SaaS foundation
* Enable monetization (premium plans)
* Provide portfolio-grade system design

---

# 3. 👤 TARGET USERS

## 🎓 Students

* Need revision notes quickly

## 👨‍💻 Developers

* Learning from tutorials

## 📚 Researchers

* Extract structured insights

## 🎯 Power Users (Future)

* Content creators
* Educators

---

# 4. 🧩 CORE FEATURES (MVP)

## 🔥 4.1 Notes Generation

* Input YouTube URL
* Extract transcript
* AI processing
* Structured markdown output

---

## 🧠 4.2 AI Processing Pipeline

* Remove filler words
* Segment content
* Generate:

  * title
  * overview
  * concepts
  * steps
  * examples
  * takeaways
  * glossary

---

## 👤 4.3 User Authentication (Supabase)

* Email/password signup
* Google OAuth
* Email verification
* Secure session handling

---

## 📂 4.4 Notes Management

* Save notes per user
* View history
* Delete notes
* Search notes (basic)

---

## ⚡ 4.5 UI Features

* URL input box
* Generate button
* Loading state
* Markdown preview
* Copy to clipboard
* Download `.md`

---

## 📊 4.6 Usage Control

* Free users: limited usage
* Premium users: extended usage

---

# 5. 🏗️ SYSTEM ARCHITECTURE

```text
Frontend (React + Tailwind)
        ↓
Supabase Auth (JWT)
        ↓
FastAPI Backend
        ↓
Transcript Extraction
        ↓
CrewAI + OpenRouter
        ↓
Markdown Generator
        ↓
Supabase DB + Storage
```

---

# 6. 🏗️ TECH STACK

## Frontend

* React (Vite)
* Tailwind CSS
* Supabase JS Client
* Markdown Renderer

## Backend

* FastAPI (Python)
* youtube-transcript-api
* CrewAI
* OpenRouter

## Backend-as-a-Service

* Supabase

## Deployment

* Frontend: Vercel
* Backend: Render / Railway

---

# 7. 🔐 AUTHENTICATION & AUTHORIZATION

## Functional Requirements

* Users must sign up/login
* Email verification required
* JWT-based authentication
* Protected routes

## Roles

| Role    | Permissions           |
| ------- | --------------------- |
| Guest   | View landing only     |
| User    | Generate + save notes |
| Premium | Higher limits         |
| Admin   | System control        |

---

## Security Requirements

* Row Level Security (RLS) enforced
* JWT validation in backend
* Rate limiting
* Secure password handling

---

# 8. 🧠 DATABASE DESIGN

## Table: notes

```sql
id (uuid)
user_id (uuid)
youtube_url (text)
video_title (text)
markdown_content (text)
created_at (timestamp)
```

## Table: usage_limits

```sql
id
user_id
daily_count
monthly_count
last_reset
```

## Table: profiles

```sql
id
user_id
full_name
avatar_url
plan
created_at
```

---

# 9. 🔌 API DESIGN

## POST `/generate-notes`

### Headers

```
Authorization: Bearer <JWT>
```

### Request

```json
{
  "youtube_url": "string"
}
```

### Response

```json
{
  "markdown": "string",
  "title": "string",
  "status": "success"
}
```

---

## GET `/notes`

* fetch user notes

## DELETE `/notes/:id`

* delete note

## GET `/profile`

* user info

---

# 10. 🎨 UI/UX DESIGN

## Pages

### Public

* Landing Page
* Login
* Signup

### Protected

* Dashboard
* Generate Page
* Notes History
* Note Viewer
* Profile
* Settings

---

## UI States

* Idle
* Loading
* Success
* Error

---

## Design Principles

* Minimal
* Fast
* Modern
* AI-focused
* Dark + Light theme

---

# 11. ⚠️ EDGE CASES

* No transcript available
* Very long videos
* Private videos
* API failure
* Rate limits exceeded

---

# 12. 🔐 SECURITY DESIGN

## Must Implement

* JWT verification in backend
* RLS in database
* Input validation
* Rate limiting

---

## Optional Advanced

* session tracking
* audit logs
* suspicious activity detection

---

# 13. 🚀 DEPLOYMENT PLAN

## Step 1

Setup Supabase project

## Step 2

Deploy FastAPI backend

## Step 3

Deploy React frontend

## Step 4

Connect all services

---

# 14. 🧪 TESTING STRATEGY

## Unit Testing

* transcript extraction
* AI output formatting

## Integration Testing

* frontend ↔ backend

## Manual Testing

* different URLs
* edge cases

---

# 15. 📊 FUTURE ROADMAP

## Phase 2

* multilingual support
* chunking for long videos
* AI highlights

## Phase 3

* collaboration (share notes)
* PDF export
* mobile version

## Phase 4

* subscription billing
* analytics dashboard

---

# 16. 📌 ACCEPTANCE CRITERIA

* User can sign up/login
* User can input URL
* Notes generated < 20s
* Notes saved to DB
* Notes retrievable
* Copy/download works

---

# 17. 🧠 USP (UNIQUE SELLING POINT)

* Agentic AI pipeline (CrewAI)
* Structured educational output
* Full-stack SaaS architecture
* Secure multi-user system

---

# 18. 🏁 FINAL SUMMARY

This is not just a project — it is a **complete SaaS product** combining:

* AI
* full-stack engineering
* authentication
* database design
* scalable architecture

---

# ⚡ BONUS (Resume Line)

> Built a full-stack AI SaaS platform using React, FastAPI, and Supabase that converts YouTube videos into structured markdown notes using agentic AI, improving learning efficiency by ~80%.

---
