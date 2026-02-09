from pydantic import BaseModel, Field


class PostSignupRequest(BaseModel):
    supabase_user_id: str
    email: str
    role: str = Field(..., pattern="^(candidate|employer)$")

    # Required for candidate
    full_name: str | None = None

    # Required for employer
    company_name: str | None = None
    industry: str | None = None

    def validate_role_fields(self) -> list[str]:
        """Returns list of validation errors."""
        errors = []
        if self.role == "candidate":
            if not self.full_name or not self.full_name.strip():
                errors.append("full_name is required for candidates")
        if self.role == "employer":
            if not self.company_name or not self.company_name.strip():
                errors.append("company_name is required for employers")
        return errors
