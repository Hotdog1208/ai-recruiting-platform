from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, jobs, employers, candidates, users, applications, matching, external_jobs, saved_jobs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(employers.router)
app.include_router(candidates.router)
app.include_router(users.router)
app.include_router(applications.router)
app.include_router(matching.router)
app.include_router(external_jobs.router)
app.include_router(saved_jobs.router)


@app.get("/health")
def health():
    return {"status": "ok"}
