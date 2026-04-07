import os
from sqlalchemy import create_engine, update
from sqlalchemy.orm import Session
from app.models.profile import Profile
from dotenv import load_dotenv

def promote_to_admin(email):
    load_dotenv()
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("Error: DATABASE_URL not found in .env")
        return

    engine = create_engine(db_url)
    with Session(engine) as session:
        query = update(Profile).where(Profile.email == email).values(role='admin')
        result = session.execute(query)
        session.commit()
        
        if result.rowcount > 0:
            print(f"Success: User {email} promoted to admin.")
        else:
            print(f"Error: User {email} not found in the database.")

if __name__ == "__main__":
    email = input("Enter email to promote to admin: ")
    promote_to_admin(email)
