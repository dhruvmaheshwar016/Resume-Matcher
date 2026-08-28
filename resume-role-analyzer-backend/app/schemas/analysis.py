from pydantic import BaseModel
from typing import List, Optional


# ── Request ──────────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    """Sent when resume text is already extracted (e.g. pasted text)."""
    resume_text: str
    job_description: str


# ── Response ─────────────────────────────────────────────────────────────────

class SkillMatch(BaseModel):
    skill: str
    found_in_resume: bool
    found_in_job: bool


class ScoreBreakdown(BaseModel):
    overall_score: int           # 0–100
    skills_score: int
    keyword_score: int
    experience_score: int
    formatting_score: int


class AnalysisResult(BaseModel):
    scores: ScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    summary: str                 # 2–3 sentence AI summary
    ats_tips: List[str]          # ATS-specific improvement tips
