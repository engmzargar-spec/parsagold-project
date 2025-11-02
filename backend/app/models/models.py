from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AccessGrade(enum.Enum):
    CHIEF = "chief"
    GRADE1 = "grade1"
    GRADE2 = "grade2"
    GRADE3 = "grade3"

class TradeType(enum.Enum):
    BUY = "buy"
    SELL = "sell"

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    national_id = Column(String, unique=True, index=True)
    password_hash = Column(String)
    
    # فیلدهای جدید اضافه شده
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    address = Column(Text, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    role = Column(Enum(UserRole), default=UserRole.USER)
    access_grade = Column(Enum(AccessGrade), nullable=True)
    is_active = Column(Boolean, default=True)
    needs_approval = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"
    
    def is_admin(self):
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    def is_chief(self):
        return self.is_admin() and self.access_grade == AccessGrade.CHIEF

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default='admin')  # admin, chief, support, moderator
    permissions = Column(Text, default='{"users": "read", "trades": "read"}')
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<AdminUser {self.username} ({self.role})>"
        
    def has_permission(self, permission):
        import json
        try:
            user_perms = json.loads(self.permissions)
            return user_perms.get(permission, False)
        except:
            return False
            
    def is_chief(self):
        return self.role == 'chief'

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    gold_type = Column(String)
    amount = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    trade_type = Column(Enum(TradeType))
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String)
    total_value = Column(Float, default=0.0)
    profit_loss = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GoldPrice(Base):
    __tablename__ = "gold_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    gold_type = Column(String)
    price = Column(Float)
    change_percentage = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    type = Column(String)  # deposit, withdrawal, trade
    amount = Column(Float)
    currency = Column(String, default="IRT")
    status = Column(String, default="pending")
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    currency = Column(String, default="IRT")
    balance = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String)
    description = Column(String)
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    priority = Column(String, default="medium")  # low, medium, high, urgent
    assigned_admin_id = Column(Integer, ForeignKey('admin_users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    sender_id = Column(Integer)
    sender_type = Column(String)  # user, admin
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemConfig(Base):
    __tablename__ = "system_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String, unique=True, index=True)
    config_value = Column(String)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey('admin_users.id'), nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    action = Column(String)
    description = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)