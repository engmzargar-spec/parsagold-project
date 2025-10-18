# backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

# ✅ import از فایل database در همان پوشه
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True, nullable=False)
    symbol = Column(String(20), nullable=False)
    quantity = Column(Numeric(10, 4), nullable=False)
    price = Column(Numeric(15, 6), nullable=False)
    trade_type = Column(String(10), nullable=False)
    status = Column(String(20), default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, index=True, nullable=False)
    total_balance = Column(Numeric(15, 6), default=0)
    available_balance = Column(Numeric(15, 6), default=0)
    invested_amount = Column(Numeric(15, 6), default=0)
    holdings = Column(Text)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")