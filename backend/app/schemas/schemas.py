from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class AccessGrade(str, Enum):
    CHIEF = "chief"
    GRADE1 = "grade1"
    GRADE2 = "grade2"
    GRADE3 = "grade3"

class TradeType(str, Enum):
    BUY = "buy"
    SELL = "sell"

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class AdminRole(str, Enum):
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    CHIEF = "chief"
    SUPPORT = "support"
    MODERATOR = "moderator"

class AccessLevel(str, Enum):
    BASIC = "basic"
    MEDIUM = "medium"
    ADVANCED = "advanced"
    FULL = "full"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone: str
    first_name: str
    last_name: str
    national_id: str

class UserCreate(UserBase):
    password: str
    confirm_password: str
    # فیلدهای جدید اضافه شده
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    
    @validator('first_name', 'last_name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('نام باید حداقل ۲ کاراکتر باشد')
        return v.strip()
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('رمز عبور باید حداقل ۸ کاراکتر باشد')
        if not any(c.islower() for c in v):
            raise ValueError('رمز عبور باید شامل حروف کوچک باشد')
        if not any(c.isupper() for c in v):
            raise ValueError('رمز عبور باید شامل حروف بزرگ باشد')
        if not any(c.isdigit() for c in v):
            raise ValueError('رمز عبور باید شامل اعداد باشد')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?`~' for c in v):
            raise ValueError('رمز عبور باید شامل علائم خاص باشد')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('رمز عبور و تکرار آن مطابقت ندارند')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        v = v.strip()
        
        # اگر 9 رقم بود (بدون 09)، 09 اضافه کن
        if len(v) == 9 and v.isdigit():
            return f"09{v}"
        # اگر 11 رقم بود با 09، قبول کن
        elif len(v) == 11 and v.startswith('09') and v.isdigit():
            return v
        else:
            raise ValueError('شماره موبایل باید 9 رقم (بدون 09) یا 11 رقم (با 09) باشد')
    
    @validator('national_id')
    def validate_national_id(cls, v):
        v = v.strip()
        if len(v) != 10 or not v.isdigit():
            raise ValueError('کد ملی باید 10 رقم باشد')
        return v
    
    @validator('email')
    def detect_admin_role(cls, v, values):
        """تشخیص خودکار نقش ادمین بر اساس ایمیل"""
        admin_codes = {
            "adminpg1357": UserRole.ADMIN,
            "superadminpg2468": UserRole.SUPER_ADMIN
        }
        
        for code, role in admin_codes.items():
            if code in v:
                if 'role' not in values:
                    values['role'] = role
                break
        
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    balance: float
    is_active: bool
    is_verified: bool
    created_at: datetime
    # فیلدهای جدید اضافه شده
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True

# ✅ AdminUser Schemas - جدید اضافه شده
class AdminUserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[Gender] = Gender.MALE
    profile_image: Optional[str] = None
    organizational_position: Optional[str] = None
    role: Optional[AdminRole] = AdminRole.ADMIN
    access_level: Optional[AccessLevel] = AccessLevel.BASIC
    is_active: Optional[bool] = True
    is_approved: Optional[bool] = False

class AdminUserCreate(AdminUserBase):
    password: str
    confirm_password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('رمز عبور باید حداقل ۶ کاراکتر باشد')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('رمز عبور و تکرار آن مطابقت ندارند')
        return v

class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[Gender] = None
    profile_image: Optional[str] = None
    organizational_position: Optional[str] = None
    role: Optional[AdminRole] = None
    access_level: Optional[AccessLevel] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None

class AdminUserResponse(AdminUserBase):
    id: int
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminUserListResponse(BaseModel):
    admins: List[AdminUserResponse]
    total: int
    page: int
    page_size: int

# Admin Management Schemas
class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str
    first_name: str
    last_name: str
    phone: str
    national_id: str
    access_grade: AccessGrade
    # فیلدهای جدید اضافه شده
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    
    @validator('first_name', 'last_name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('نام باید حداقل ۲ کاراکتر باشد')
        return v.strip()
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('رمز عبور باید حداقل ۸ کاراکتر باشد')
        if not any(c.islower() for c in v):
            raise ValueError('رمز عبور باید شامل حروف کوچک باشد')
        if not any(c.isupper() for c in v):
            raise ValueError('رمز عبور باید شامل حروف بزرگ باشد')
        if not any(c.isdigit() for c in v):
            raise ValueError('رمز عبور باید شامل اعداد باشد')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?`~' for c in v):
            raise ValueError('رمز عبور باید شامل علائم خاص باشد')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('رمز عبور و تکرار آن مطابقت ندارند')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        v = v.strip()
        
        # اگر 9 رقم بود (بدون 09)، 09 اضافه کن
        if len(v) == 9 and v.isdigit():
            return f"09{v}"
        # اگر 11 رقم بود با 09، قبول کن
        elif len(v) == 11 and v.startswith('09') and v.isdigit():
            return v
        else:
            raise ValueError('شماره موبایل باید 9 رقم (بدون 09) یا 11 رقم (با 09) باشد')
    
    @validator('national_id')
    def validate_national_id(cls, v):
        v = v.strip()
        if len(v) != 10 or not v.isdigit():
            raise ValueError('کد ملی باید 10 رقم باشد')
        return v

class AdminLogin(BaseModel):
    username: str  # تغییر از EmailStr به str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    national_id: str
    role: UserRole
    access_grade: Optional[AccessGrade]
    is_active: bool
    is_verified: bool
    needs_approval: bool
    balance: float
    created_at: datetime
    # فیلدهای جدید اضافه شده
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class AdminToken(BaseModel):
    access_token: str
    token_type: str
    admin: AdminResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None

# Admin Dashboard Schemas
class AdminDashboardStats(BaseModel):
    total_users: int
    total_admins: int
    active_users: int
    total_transactions: int
    total_trades: int
    pending_verifications: int
    total_volume: float
    total_profit: float
    total_loss: float
    active_tickets: int
    unread_messages: int
    system_health: str

# Trade Schemas
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
    trade_type: TradeType
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class TradeAnalytics(BaseModel):
    total_trades: int
    total_volume: float
    profit_loss: float
    active_trades: int
    most_traded_asset: str

# User Management Schemas
class UserDetailResponse(UserResponse):
    is_active: bool
    last_login: Optional[datetime]
    total_assets: float
    total_profit_loss: float
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[Gender] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            v = v.strip()
            if not v.startswith('09') or len(v) != 11 or not v.isdigit():
                raise ValueError('شماره موبایل باید با 09 شروع شده و 11 رقم باشد')
        return v

class UserWalletResponse(BaseModel):
    id: int
    user_id: int
    currency: str
    balance: float
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserPortfolioResponse(BaseModel):
    id: int
    user_id: int
    name: str
    total_value: float
    profit_loss: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    type: str
    amount: float
    currency: str
    status: str
    description: Optional[str]
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

# Support System Schemas
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"

class TicketResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    status: TicketStatus
    priority: str
    assigned_admin_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    ticket_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    sender_type: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Approval System Schemas
class AdminApprovalResponse(BaseModel):
    id: int
    admin_id: int
    admin: AdminResponse
    status: ApprovalStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ApprovalAction(BaseModel):
    admin_id: int
    action: ApprovalStatus
    notes: Optional[str] = None

# System Logs Schemas
class SystemLogResponse(BaseModel):
    id: int
    admin_id: Optional[int]
    action: str
    description: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Bulk Actions Schemas
class BulkMessageCreate(BaseModel):
    user_ids: List[int]
    subject: str
    content: str
    send_email: bool = False
    send_notification: bool = True

class UserFilter(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    access_grade: Optional[AccessGrade] = None
    gender: Optional[Gender] = None
    country: Optional[str] = None
    city: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

# Search Schemas
class UserSearch(BaseModel):
    query: str
    search_type: str = "all"

class TradeSearch(BaseModel):
    user_id: Optional[int] = None
    asset_type: Optional[str] = None
    trade_type: Optional[TradeType] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

# User Stats Schemas
class UserStatsResponse(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    inactive_users: int
    users_by_gender: dict
    users_by_country: dict

class UserVerificationRequest(BaseModel):
    user_id: int
    is_verified: bool
    verification_notes: Optional[str] = None