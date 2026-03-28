# 🚀 AI YouTube Notes Generator

An **Agentic AI application** built using CrewAI and OpenRouter that converts YouTube videos into **structured, study-ready markdown notes**.

🔗 Repo: https://github.com/Shrikanth70/Youtube_notes_generator.git

---

## 📌 Overview

This project automates the process of turning long YouTube videos into **clean, well-structured notes** using AI agents.

It:
- Extracts transcripts from YouTube videos  
- Processes raw spoken content  
- Generates structured notes in markdown format  

---

## ✨ Features

- 🎥 Input: YouTube video URL  
- 🧠 AI-powered note generation  
- 📝 Structured markdown output  
- ⚡ Clean and readable notes (no filler content)  
- 💾 Saves output as `.md` file  
- 🔄 Designed for long-form content (chunking upgrade coming soon)  

---

## 🧠 How It Works


YouTube URL
↓
Extract Video ID
↓
Fetch Transcript
↓
CrewAI Agent
↓
OpenRouter LLM
↓
Structured Markdown Notes


---

## 🏗️ Architecture


main.py
│
├── utils.py
│ ├── extract_video_id()
│ └── get_transcript_text()
│
├── Agent (CrewAI)
│ └── Notes Generator
│
└── Output
└── generated_notes.md


---

## ⚙️ Tech Stack

- Python  
- CrewAI (Agent orchestration)  
- OpenRouter (LLM access)  
- youtube-transcript-api  
- python-dotenv  

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Shrikanth70/Youtube_notes_generator.git
cd Youtube_notes_generator
2. Create virtual environment
python -m venv .venv

Activate:

Windows

.venv\Scripts\activate

Mac/Linux

source .venv/bin/activate
3. Install dependencies
pip install -r requirements.txt
🔑 Setup Environment Variables

Create a .env file:

OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=your_open_router_model  {I used nvidia/nemotron-3-super-120b-a12b:free}

⚠️ Important:

Never push .env to GitHub
Add .env to .gitignore
▶️ Usage

Run the application:

python main.py

Then enter:

Enter YouTube video URL:
📄 Output

The generated notes will be saved as:

generated_notes.md
🧪 Example Output Structure
# Title

## Overview

## Key Concepts

## Step-by-Step Explanation

## Important Examples

## Practical Takeaways

## Quick Revision

## Glossary
⚠️ Limitations
Requires available YouTube transcripts
Very long videos may be slow without chunking
Free models may have latency issues
Output quality depends on transcript clarity
🚀 Future Improvements
Chunking for long transcripts
Multi-agent system (notes + flashcards + quiz)
Streamlit/Web UI
Export to PDF / Notion
Topic segmentation
💡 Use Cases
Students creating study notes
Lecture revision
Learning from tutorials
Summarizing long educational videos
🧠 Key Learnings
Agentic AI with CrewAI
LLM integration via OpenRouter
Prompt engineering for structured output
Debugging real-world AI pipelines
🤝 Contributing

Contributions are welcome!

Fork → Create Branch → Commit → Push → Pull Request
📜 License

MIT License

👨‍💻 Author

Shrikanth
AI/ML Engineer | Full-Stack Developer

⭐ If you found this useful

Give this repo a ⭐ and share it!


---

# 🔥 Optional Upgrade (Highly Recommended)

Add this at the top later:

```md
## 🔥 Live Demo (Coming Soon)
