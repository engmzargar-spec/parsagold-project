from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Trade Schemas
class TradeType(str, Enum):
    BUY = "buy"
    SELL = "sell"

class TradeCreate(BaseModel):
    gold_type: str
    amount: float
    trade_type: TradeType

class TradeResponse(BaseModel):
    id: int
    user_id: int
    gold_type: str
    amount: float
    price: float
    total_amount: float
    trade_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Gold Price Schemas
class GoldPriceResponse(BaseModel):
    id: int
    gold_type: str
    price: float
    change_percentage: float
    last_updated: datetime

    class Config:
        from_attributes = True

# System Config Schemas
class SystemConfigResponse(BaseModel):
    id: int
    config_key: str
    config_value: str
    description: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True