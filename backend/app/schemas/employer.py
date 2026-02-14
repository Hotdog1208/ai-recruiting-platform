from pydantic import BaseModel


class EmployerUpdate(BaseModel):
    company_name: str | None = None
    industry: str | None = None
    website: str | None = None
    domain: str | None = None
    company_size: str | None = None
    location: str | None = None
    description: str | None = None
