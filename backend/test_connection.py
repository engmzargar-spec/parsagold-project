import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:Mezr%401360@localhost:5432/parsagold"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print("✅ PostgreSQL Version:", result.scalar())
        
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in result]
        print("📊 Tables:", tables)
        print("🎯 SUCCESS: Connected to PostgreSQL!")
        
except Exception as e:
    print("❌ Connection failed:", e)
