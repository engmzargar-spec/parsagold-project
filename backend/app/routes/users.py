# backend/app/routes/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

@router.get("/me")
async def get_current_user_info(current_user=Depends(get_current_user)):
    return current_user

# backend/app/routes/transactions.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_transactions():
    return {"message": "لیست تراکنش‌ها"}

# backend/app/routes/portfolio.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_portfolio():
    return {"message": "اطلاعات پورتفو"}