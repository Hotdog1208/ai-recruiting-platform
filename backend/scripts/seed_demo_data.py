"""
Seed demo employer and jobs for local/dev. Run from backend dir with venv activated.
Usage: python scripts/seed_demo_data.py
"""
import os
import sys
import uuid

# Run from backend root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models import User, Employer, Job
from app.db.base import Base

# Load .env and validate DATABASE_URL (same as app)
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

from app.core.env_validation import validate_database_url
try:
    DATABASE_URL = validate_database_url(os.getenv("DATABASE_URL"))
except RuntimeError as e:
    print(e)
    sys.exit(1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

DEMO_USER_ID = uuid.UUID("00000000-0000-4000-8000-000000000001")
DEMO_EMAIL = "demo@recruiter.solutions"

JOBS = [
    {"title": "Senior Software Engineer", "description": "Build scalable systems. 5+ years. Python, Go, or Node.", "location": "San Francisco, CA", "remote": True},
    {"title": "Frontend Developer", "description": "React/Next.js. Design systems and accessibility.", "location": "New York, NY", "remote": False},
    {"title": "Data Engineer", "description": "ETL, data pipelines, Spark/SQL. Remote-first.", "location": "Remote", "remote": True},
    {"title": "Product Manager", "description": "Own roadmap and stakeholder alignment. 3+ years PM.", "location": "Austin, TX", "remote": True},
    {"title": "DevOps Engineer", "description": "Kubernetes, AWS/GCP, CI/CD.", "location": "Seattle, WA", "remote": False},
]


def main():
    db = Session()
    try:
        user = db.query(User).filter(User.id == DEMO_USER_ID).first()
        if not user:
            user = User(id=DEMO_USER_ID, email=DEMO_EMAIL, role="employer")
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo user {DEMO_EMAIL}")
        else:
            print(f"Demo user already exists: {DEMO_EMAIL}")

        employer = db.query(Employer).filter(Employer.user_id == DEMO_USER_ID).first()
        if not employer:
            employer = Employer(
                user_id=DEMO_USER_ID,
                company_name="Demo Company",
                industry="Technology",
                location="San Francisco, CA",
            )
            db.add(employer)
            db.commit()
            db.refresh(employer)
            print("Created demo employer: Demo Company")
        else:
            print("Demo employer already exists")

        created = 0
        for j in JOBS:
            exists = db.query(Job).filter(Job.employer_id == employer.id, Job.title == j["title"]).first()
            if not exists:
                job = Job(
                    employer_id=employer.id,
                    title=j["title"],
                    description=j["description"],
                    location=j["location"],
                    remote=j["remote"],
                )
                db.add(job)
                created += 1
        db.commit()
        print(f"Created {created} demo job(s). Browse Jobs should now list them.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
