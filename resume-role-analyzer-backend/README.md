# Resume Role Analyzer — FastAPI Backend

AI-powered resume analysis backend using **FastAPI** + **Gemini AI** + **SQLite**.

## Quick Start

### 1. Create & activate virtual environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Edit `.env` and set your values:
```
GEMINI_API_KEY=your_key_from_aistudio.google.com
SECRET_KEY=some-long-random-string
```

### 4. Run the server
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Open API docs
- Swagger UI → http://localhost:8000/docs
- ReDoc     → http://localhost:8000/redoc

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Health check |
| `POST` | `/auth/signup` | ❌ | Register new user |
| `POST` | `/auth/signin` | ❌ | Login → JWT |
| `GET` | `/auth/me` | ✅ | Current user profile |
| `POST` | `/analyze/pdf` | ✅ | Upload PDF resume + job desc |
| `POST` | `/analyze/text` | ✅ | Plain text resume + job desc |

---

## Project Structure

```
app/
├── main.py              # Entry point, CORS, routers
├── config.py            # Settings from .env
├── database.py          # SQLAlchemy / SQLite setup
├── dependencies.py      # JWT auth dependency
├── models/user.py       # User DB model
├── schemas/
│   ├── auth.py          # SignUp/SignIn/Token schemas
│   └── analysis.py      # AnalysisRequest/Result schemas
├── routers/
│   ├── auth.py          # Auth endpoints
│   └── analysis.py      # Analysis endpoints
└── services/
    ├── auth_service.py  # bcrypt + JWT logic
    ├── pdf_service.py   # pdfplumber PDF extraction
    └── gemini_service.py # Gemini AI analysis
```

## Switching to PostgreSQL
Change `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/resume_analyzer
```
Then remove `connect_args` in `database.py` (SQLite-only argument).
