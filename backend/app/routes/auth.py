# backend/app/routes/auth.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
async def auth_test():
    return {"message": "سیستم احراز هویت پارسا گلد فعال است"}

@router.post("/register")
async def register_user():
    return {"message": "ثبت‌نام - به زودی فعال می‌شود"}