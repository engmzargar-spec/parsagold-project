# backend/app/routes/central_management/test_routes.py
from fastapi import APIRouter

router = APIRouter(tags=["Central Management - Test"])

@router.get("/central-test")
async def central_test():
    return {
        "message": "✅ سیستم مرکزی کار می‌کند!",
        "status": "success"
    }

@router.get("/test-users")
async def test_users():
    return {
        "message": "تست کاربران",
        "data": ["کاربر ۱", "کاربر ۲", "کاربر ۳"]
    }