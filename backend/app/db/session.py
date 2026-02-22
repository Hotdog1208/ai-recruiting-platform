from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import get_settings

_settings = get_settings()

# Sync Engine (Legacy - preserving for incremental migration)
engine = create_engine(_settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async Engine (New Data-Oriented Arc)
async_engine = create_async_engine(_settings.async_database_url, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=async_engine, class_=AsyncSession)

async def get_async_db():
    async with AsyncSessionLocal() as db:
        yield db
