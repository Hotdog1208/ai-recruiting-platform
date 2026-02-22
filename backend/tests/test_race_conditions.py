import asyncio
import httpx  # type: ignore
from dotenv import load_dotenv  # type: ignore
load_dotenv()

from sqlalchemy.future import select  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy.exc import IntegrityError  # type: ignore
from app.db.session import SessionLocal  # type: ignore
from app.models import User, Candidate, Employer, Job, Application  # type: ignore

async def test_race_condition():
    # 1. Setup DB state
    with SessionLocal() as db:
        # Create an employer
        emp_user = User(email="emp@test-race.com", role="employer")
        db.add(emp_user)
        db.commit()
        db.refresh(emp_user)
        
        emp = Employer(user_id=emp_user.id, company_name="Race Test Corp")
        db.add(emp)
        db.commit()
        db.refresh(emp)
        
        # Create a job
        job = Job(employer_id=emp.id, title="Test Job", description="Testing races", requirements="None", location="Remote", remote=True)
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Create a candidate
        cand_user = User(email="cand@test-race.com", role="candidate")
        db.add(cand_user)
        db.commit()
        db.refresh(cand_user)
        
        cand = Candidate(user_id=cand_user.id, full_name="Racey Tester")
        db.add(cand)
        db.commit()
        db.refresh(cand)
        
        job_id = str(job.id)
        cand_id = str(cand.id)
        cand_user_id = str(cand_user.id)
        
    print(f"Created Job: {job_id}")
    print(f"Created Candidate User: {cand_user_id}")

    # 2. Fire concurrent requests to the API
    from app.core.config import get_settings  # type: ignore
    import jwt  # type: ignore
    
    settings = get_settings()
    token = jwt.encode(
        {"sub": cand_user_id, "email": "cand@test-race.com"},
        settings.SUPABASE_JWT_SECRET,
        algorithm="HS256"
    )
    headers = {"Authorization": f"Bearer {token}"}
    
    url = f"http://localhost:8000/api/v1/applications?job_id={job_id}"
    
    async with httpx.AsyncClient() as client:
        # Fire 5 concurrent requests representing a frantic user clicking the apply button
        tasks = [client.post(url, headers=headers) for _ in range(5)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        print("--- CONCURRENT RESPONSES ---")
        for i, r in enumerate(responses):
            if isinstance(r, Exception):
                print(f"Request {i+1}: Blocked by Exception {type(r).__name__}")
            else:
                print(f"Request {i+1}: Status {r.status_code}")
    
    # 3. Verify exactly one application was created
    print(f"\n--- VERIFICATION ---")
    with SessionLocal() as db:
        apps = db.query(Application).filter(
            Application.job_id == job_id,
            Application.candidate_id == cand_id
        ).all()
        
        print(f"Total Applications existing in DB: {len(apps)}")
        if len(apps) == 1:
            print("SUCCESS! DB-level Unique Constraints successfully deflected race conditions!")
        else:
            print("FAILED! Duplicate entries found.")
        
        # Cleanup
        for app in apps:
            db.delete(app)
        db.delete(cand)
        db.delete(cand_user)
        db.delete(job)
        db.delete(emp)
        db.delete(emp_user)
        db.commit()

if __name__ == "__main__":
    asyncio.run(test_race_condition())
