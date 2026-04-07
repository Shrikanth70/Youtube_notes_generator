import os
import sys
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add backend directory to sys.path to find 'app'
sys.path.append(os.getcwd())

from app.models.profile import Profile

def list_users():
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return

    try:
        engine = create_engine(db_url)
        with Session(engine) as session:
            users = session.execute(select(Profile)).scalars().all()
            for u in users:
                print(f"Email: {u.email} | Current Role: {u.role}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    list_users()
