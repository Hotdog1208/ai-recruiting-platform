import uuid
import jwt
from typing import Annotated
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.db.session import get_db
from app.core.config import get_settings
from app.models import User, Candidate, Employer
from sqlalchemy.orm import Session

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Session = Depends(get_db),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Session expired or missing. Please log in again.")
    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except Exception:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in again.")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please log in again.")
    user_id = uuid.UUID(sub)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found. Please log in again.")

    return {
        "sub": sub,
        "email": payload.get("email") or user.email,
        "role": user.role,
        "user_id": user_id,
    }


def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Session = Depends(get_db),
):
    if not credentials:
        return None
    try:
        settings = get_settings()
    except Exception:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        sub = payload.get("sub")
        if not sub:
            return None
        user_id = uuid.UUID(sub)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return {"sub": sub, "email": user.email, "role": user.role, "user_id": user_id}
    except Exception:
        return None


def require_candidate(
    current: Annotated[dict, Depends(get_current_user)],
):
    if current.get("role") != "candidate":
        raise HTTPException(status_code=403, detail="Requires candidate role")
    return current


def require_employer(
    current: Annotated[dict, Depends(get_current_user)],
):
    if current.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Requires employer role")
    return current
