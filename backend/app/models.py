from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER)
    balance = Column(Float, default=1000000.00)  # موجودی اولیه
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class GoldPrice(Base):
    __tablename__ = "gold_prices"

    id = Column(Integer, primary_key=True, index=True)
    gold_type = Column(String(50), nullable=False)
    price = Column(Float, nullable=False)
    change_percentage = Column(Float, default=0.0)  # درصد تغییر
    last_updated = Column(DateTime, default=func.now())

class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    gold_type = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)  # مقدار طلا
    price = Column(Float, nullable=False)   # قیمت در زمان معامله
    total_amount = Column(Float, nullable=False)  # مبلغ کل
    trade_type = Column(String(10), nullable=False)  # buy/sell
    status = Column(String(20), default="completed")  # completed, pending, cancelled
    created_at = Column(DateTime, default=func.now())

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, nullable=False)
    config_value = Column(Text, nullable=False)
    description = Column(Text)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())