from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.analysis import AnalysisRequest, AnalysisResult
from app.services.gemini_service import analyze_resume
from app.services.pdf_service import clean_resume_text, extract_text_from_pdf

router = APIRouter(prefix="/analyze", tags=["Analysis"])

ALLOWED_CONTENT_TYPES = {"application/pdf"}
MAX_FILE_SIZE_MB = 5


@router.post("/pdf", response_model=AnalysisResult)
async def analyze_pdf(
    job_description: str = Form(..., description="The job description text"),
    resume_file: UploadFile = File(..., description="PDF resume file"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF resume + job description text.
    Returns a detailed AI-powered match analysis from Gemini.
    """
    # Validate file type
    if resume_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are supported.",
        )

    # Read and validate file size
    file_bytes = await resume_file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB.",
        )

    # Extract text from PDF
    try:
        raw_text = extract_text_from_pdf(file_bytes)
        resume_text = clean_resume_text(raw_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract text from PDF: {str(e)}",
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No text could be extracted from the PDF. Please ensure it is not a scanned image.",
        )

    # Run Gemini analysis
    try:
        result = analyze_resume(resume_text, job_description)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    return result


@router.post("/text", response_model=AnalysisResult)
async def analyze_text(
    payload: AnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Provide resume text directly (no file upload).
    Useful when resume text is already extracted client-side.
    """
    if not payload.resume_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="resume_text cannot be empty.")
    if not payload.job_description.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="job_description cannot be empty.")

    try:
        result = analyze_resume(payload.resume_text, payload.job_description)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    return result
