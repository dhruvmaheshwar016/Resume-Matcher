import json
import re
import google.generativeai as genai

from app.config import settings
from app.schemas.analysis import AnalysisResult, ScoreBreakdown

# Configure Gemini once at import time
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(settings.GEMINI_MODEL)


ANALYSIS_PROMPT = """
You are an expert ATS (Applicant Tracking System) and career coach AI.

Analyse the following resume against the job description and return a detailed JSON response.

RESUME:
\"\"\"
{resume_text}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{job_description}
\"\"\"

Return ONLY a valid JSON object with exactly this structure (no markdown, no explanation):
{{
  "scores": {{
    "overall_score": <integer 0-100>,
    "skills_score": <integer 0-100>,
    "keyword_score": <integer 0-100>,
    "experience_score": <integer 0-100>,
    "formatting_score": <integer 0-100>
  }},
  "matched_skills": [<list of skills present in both resume and job description>],
  "missing_skills": [<list of skills required by job but absent from resume>],
  "strengths": [<3-5 specific strengths of this resume for this role>],
  "weaknesses": [<3-5 specific weaknesses or gaps>],
  "recommendations": [<5 actionable improvements the candidate should make>],
  "summary": "<2-3 sentence overall assessment>",
  "ats_tips": [<3-5 ATS optimisation tips specific to this resume>]
}}
"""


def analyze_resume(resume_text: str, job_description: str) -> AnalysisResult:
    """
    Send resume + job description to Gemini and parse the structured response.
    """
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")

    prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text[:8000],         # Stay within token limits
        job_description=job_description[:4000],
    )

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
    raw_text = re.sub(r"\s*```$", "", raw_text)

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw response:\n{raw_text}")

    return AnalysisResult(
        scores=ScoreBreakdown(**data["scores"]),
        matched_skills=data.get("matched_skills", []),
        missing_skills=data.get("missing_skills", []),
        strengths=data.get("strengths", []),
        weaknesses=data.get("weaknesses", []),
        recommendations=data.get("recommendations", []),
        summary=data.get("summary", ""),
        ats_tips=data.get("ats_tips", []),
    )
