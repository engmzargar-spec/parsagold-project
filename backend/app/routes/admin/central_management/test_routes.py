from fastapi import APIRouter

router = APIRouter()

@router.get("/test-central")
async def test_central():
    return {"message": "Central Management System is working!"}

@router.get("/central/users")
async def get_central_users():
    return {"users": ["user1", "user2", "user3"]}