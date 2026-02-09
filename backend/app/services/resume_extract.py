"""Extract text from resume files (PDF, DOCX)."""
import io
from pypdf import PdfReader
from docx import Document


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes."""
    reader = PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def extract_text_from_docx(content: bytes) -> str:
    """Extract text from DOCX bytes."""
    doc = Document(io.BytesIO(content))
    return "\n".join(p.text for p in doc.paragraphs)


def extract_text_from_file(content: bytes, filename: str) -> str:
    """Extract text from resume file based on extension."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(content)
    if lower.endswith(".docx") or lower.endswith(".doc"):
        return extract_text_from_docx(content)
    if lower.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    raise ValueError("Unsupported file type. Use PDF, DOCX, or TXT.")
