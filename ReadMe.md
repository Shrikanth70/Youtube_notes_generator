# YouTube Notes Maker Agent

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![CrewAI](https://img.shields.io/badge/CrewAI-0.61.1-green)](https://github.com/crewAIInc/crew-ai)

A **CrewAI-powered CLI tool** that converts **YouTube video transcripts** into **detailed, structured markdown study notes**. Perfect for students and learners!

## 🚀 Features

- **AI-Powered Notes**: Uses advanced LLM (Nemotron-3) via OpenRouter to generate high-quality notes.
- **Structured Output**: Always follows a consistent format: Title, Overview, Key Concepts, Steps, Examples, Takeaways, Revision, Glossary.
- **Multi-Language Support**: Prefers English transcripts, falls back to Hindi/en-IN.
- **Robust Transcript Fetching**: Handles various YouTube URL formats and edge cases.
- **One-Command Generation**: Simple CLI: paste URL → get notes.md.
- **Clean & Study-Ready**: Removes filler words, repetitions; preserves accuracy.

## 📋 Quick Start

### Prerequisites

- Python 3.8+
- [OpenRouter API Key](https://openrouter.ai/) (free tier works)

### Setup

```bash
cd notes_maker_agent
pip install -r requirements.txt
```

Create `.env` file:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
# Optional: OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
```

### Usage

```bash
python main.py
```

- Enter YouTube URL (e.g., `https://youtu.be/dQw4w9WgXcQ`)
- ✅ Notes saved to `generated_notes.md`
- ✅ Preview printed to console

**Example**: Try a lecture video → instant study notes!

## 🛠 How It Works

```
1. Input YouTube URL
   ↓
2. Extract video ID (utils.py)
   ↓
3. Fetch & clean transcript (youtube_transcript_api)
   ↓
4. CrewAI Agent processes with structured prompt
   ↓
5. Generate & save markdown notes
```

## 📄 Generated Notes Structure

Every output follows this exact format:

- **# Title**: Concise topic summary
- **## Overview**: 2-4 para explanation
- **## Key Concepts**: Detailed bullets
- **## Step-by-Step**: Logical sections
- **## Important Examples**
- **## Practical Takeaways**
- **## Quick Revision**: Fast-review bullets
- **## Glossary**: Key terms defined

## 📁 Project Structure

```
notes_maker_agent/
├── main.py          # Core CLI + CrewAI logic
├── utils.py         # YouTube helpers (ID extract, transcript)
├── requirements.txt # Dependencies
├── README.md        # 📄 This file!
├── .env.example     # (Optional: Copy to .env)
└── generated_notes.md # 💾 Auto-generated output
```

## 🔧 Configuration

- **Default LLM**: `openrouter/nvidia/nemotron-3-super-120b-a12b:free`
- Customize in code or `.env`: `OPENROUTER_MODEL`
- Rate limits: Free tier ~10 req/min

## 🐛 Troubleshooting

| Issue              | Solution                             |
| ------------------ | ------------------------------------ |
| "Transcript empty" | Video has no captions. Try another.  |
| API key error      | Check `.env` & OpenRouter dashboard. |
| Model unavailable  | Fallback to default or change model. |
| Windows paths      | Use forward slashes or raw strings.  |

**Pro Tip**: Test with videos known to have captions!

## 📦 Requirements

See [requirements.txt](requirements.txt):

```
crewai
openai
python-dotenv
youtube-transcript-api
```

## 🤝 Contributing

1. Fork & PR
2. Add tests
3. Update this README

## 📄 License

MIT License - see [LICENSE](LICENSE) (create if needed).

## 🙏 Acknowledgments

- [CrewAI](https://crewai.com/) for agent framework
- [OpenRouter](https://openrouter.ai/) for LLM access
- [YouTube Transcript API](https://github.com/jdepoix/youtube-transcript-api)

**Made for learners, by learners. Star if useful! ⭐**
