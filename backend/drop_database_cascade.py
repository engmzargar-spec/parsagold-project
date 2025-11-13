import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def drop_database_cascade():
    """حذف تمام جداول با CASCADE"""
    with engine.connect() as conn:
        # حذف تمام جداول با CASCADE
        conn.execute("""
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
        """)
        
        # حذف تمام sequences
        conn.execute("""
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
                EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
            END LOOP;
        END $$;
        """)
    
    print("✅ تمام جداول و sequences با موفقیت حذف شدند")

if __name__ == "__main__":
    drop_database_cascade()