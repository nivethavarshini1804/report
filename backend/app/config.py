import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "math_app.db"

# Optional LLM integration (Gemini / OpenAI / Groq) if user sets key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

APP_TITLE = "AI Math Problem Explainer and Error Checker"
APP_VERSION = "1.0.0"
