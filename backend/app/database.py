from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import os

def get_db_path():
    """Get database path"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    return os.path.join(project_root, 'data', 'parsagold.db')

# Database URL
DATABASE_URL = f"sqlite:///{get_db_path()}"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Session local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database"""
    db_path = get_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()