# فایل: backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric, Text, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import bcrypt

# ایجاد Base در همین فایل
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    national_code = Column(String(10), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    country_code = Column(String(5), default="+98")
    os = Column(String(50))
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def set_password(self, password: str):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

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

class VerificationCode(Base):
    __tablename__ = "verification_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    code = Column(String(6), nullable=False)
    type = Column(String(20), nullable=False)  # 'email' or 'phone'
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())