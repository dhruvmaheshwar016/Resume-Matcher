import io
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract plain text from a PDF file given as raw bytes.
    Returns an empty string if extraction fails.
    """
    text_parts = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())

    full_text = "\n\n".join(text_parts)
    return full_text


def clean_resume_text(text: str) -> str:
    """
    Basic cleanup: remove excess whitespace, normalise line endings.
    """
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)
