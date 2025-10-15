from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from enum import Enum

# ==================== تنظیمات اولیه ====================
app = FastAPI(
    title="ParsaGold API",
    description="سیستم معاملات طلا پارساگلد",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== مسیر دیتابیس ====================
def get_db_path():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    return os.path.join(project_root, 'data', 'parsagold.db')

DB_PATH = get_db_path()

# ==================== تنظیمات امنیتی ====================
SECRET_KEY = "parsa-gold-secret-key-2024-make-this-very-secret-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

# ==================== مدل‌های Pydantic ====================
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    balance: float
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

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
    created_at: str

class GoldPriceResponse(BaseModel):
    id: int
    name: str
    current_price: float
    change_percentage: float
    updated_at: str

# ==================== توابع کمکی ====================
def get_db_connection():
    """ایجاد اتصال به دیتابیس"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """ایجاد جداول دیتابیس"""
    conn = get_db_connection()
    
    # جدول کاربران
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            balance DECIMAL(15, 2) DEFAULT 1000000.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # جدول انواع طلا
    conn.execute('''
        CREATE TABLE IF NOT EXISTS gold_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) UNIQUE NOT NULL,
            current_price DECIMAL(15, 2) NOT NULL,
            change_percentage DECIMAL(5, 2) DEFAULT 0.0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # جدول معاملات
    conn.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            gold_type VARCHAR(50) NOT NULL,
            amount DECIMAL(10, 4) NOT NULL,
            price DECIMAL(15, 2) NOT NULL,
            total_amount DECIMAL(15, 2) NOT NULL,
            trade_type VARCHAR(10) NOT NULL,
            status VARCHAR(20) DEFAULT 'completed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # اضافه کردن انواع طلا
    gold_types = [
        ('18 Ayar', 1450000.00, 0.5),
        ('24 Ayar', 1950000.00, 0.8),
        ('Emami Coin', 2500000.00, 1.2),
        ('Gold Coin', 2200000.00, 0.9)
    ]
    
    for gold_type in gold_types:
        conn.execute(
            'INSERT OR IGNORE INTO gold_types (name, current_price, change_percentage) VALUES (?, ?, ?)',
            gold_type
        )
    
    conn.commit()
    conn.close()
    print("✅ دیتابیس با موفقیت ایجاد شد!")

def get_password_hash(password: str) -> str:
    """هش کردن پسورد"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """بررسی پسورد"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """ایجاد توکن دسترسی"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(username: str, password: str):
    """احراز هویت کاربر"""
    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()
    conn.close()
    
    if not user:
        return False
    if not verify_password(password, user['password_hash']):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """دریافت کاربر از روی توکن"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, username, email, role, balance, created_at FROM users WHERE username = ?", 
        (token_data.username,)
    ).fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return dict(user)

# ==================== endpoint ها ====================
@app.on_event("startup")
async def startup_event():
    """ایجاد دیتابیس در زمان راه‌اندازی"""
    init_database()

@app.get("/")
async def root():
    return {"message": "خوش آمدید به سیستم معاملات طلا پارساگلد", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "ParsaGold",
        "timestamp": datetime.now().isoformat(),
        "database": "SQLite"
    }

# ==================== احراز هویت ====================
@app.post("/api/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ==================== کاربران ====================
@app.post("/api/users/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    conn = get_db_connection()
    
    # بررسی وجود کاربر
    existing_user = conn.execute(
        "SELECT id FROM users WHERE username = ?", (user.username,)
    ).fetchone()
    if existing_user:
        conn.close()
        raise HTTPException(status_code=400, detail="نام کاربری قبلاً ثبت شده است")
    
    existing_email = conn.execute(
        "SELECT id FROM users WHERE email = ?", (user.email,)
    ).fetchone()
    if existing_email:
        conn.close()
        raise HTTPException(status_code=400, detail="ایمیل قبلاً ثبت شده است")
    
    # ایجاد کاربر جدید
    hashed_password = get_password_hash(user.password)
    cursor = conn.execute(
        "INSERT INTO users (username, email, password_hash, balance) VALUES (?, ?, ?, ?)",
        (user.username, user.email, hashed_password, 1000000.00)
    )
    conn.commit()
    
    user_id = cursor.lastrowid
    new_user = conn.execute(
        "SELECT id, username, email, role, balance, created_at FROM users WHERE id = ?", 
        (user_id,)
    ).fetchone()
    conn.close()
    
    return dict(new_user)

@app.get("/api/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.get("/api/users/", response_model=List[UserResponse])
async def get_users():
    conn = get_db_connection()
    users = conn.execute(
        "SELECT id, username, email, role, balance, created_at FROM users"
    ).fetchall()
    conn.close()
    return [dict(user) for user in users]

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, username, email, role, balance, created_at FROM users WHERE id = ?", 
        (user_id,)
    ).fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    return dict(user)

# ==================== قیمت‌ها ====================
@app.get("/api/prices/", response_model=List[GoldPriceResponse])
async def get_gold_prices():
    conn = get_db_connection()
    prices = conn.execute("SELECT * FROM gold_types").fetchall()
    conn.close()
    return [dict(price) for price in prices]

@app.get("/api/prices/{gold_type}", response_model=GoldPriceResponse)
async def get_gold_price(gold_type: str):
    conn = get_db_connection()
    price = conn.execute(
        "SELECT * FROM gold_types WHERE name = ?", (gold_type,)
    ).fetchone()
    conn.close()
    
    if not price:
        raise HTTPException(status_code=404, detail="نوع طلا یافت نشد")
    return dict(price)

# ==================== معاملات ====================
@app.post("/api/trades/", response_model=TradeResponse)
async def create_trade(
    trade: TradeCreate,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    
    # دریافت قیمت فعلی طلا
    gold_price = conn.execute(
        "SELECT * FROM gold_types WHERE name = ?", (trade.gold_type,)
    ).fetchone()
    
    if not gold_price:
        conn.close()
        raise HTTPException(status_code=404, detail="نوع طلا یافت نشد")
    
    total_amount = trade.amount * gold_price['current_price']
    
    # بررسی موجودی برای خرید
    if trade.trade_type == "buy":
        if current_user['balance'] < total_amount:
            conn.close()
            raise HTTPException(status_code=400, detail="موجودی کافی نیست")
        
        # کسر از موجودی
        conn.execute(
            "UPDATE users SET balance = balance - ? WHERE id = ?",
            (total_amount, current_user['id'])
        )
    else:  # فروش
        # افزایش موجودی
        conn.execute(
            "UPDATE users SET balance = balance + ? WHERE id = ?",
            (total_amount, current_user['id'])
        )
    
    # ثبت معامله
    cursor = conn.execute(
        """INSERT INTO trades 
        (user_id, gold_type, amount, price, total_amount, trade_type) 
        VALUES (?, ?, ?, ?, ?, ?)""",
        (current_user['id'], trade.gold_type, trade.amount, gold_price['current_price'], 
         total_amount, trade.trade_type)
    )
    
    conn.commit()
    trade_id = cursor.lastrowid
    
    # دریافت معامله ثبت شده
    new_trade = conn.execute(
        "SELECT * FROM trades WHERE id = ?", (trade_id,)
    ).fetchone()
    
    conn.close()
    return dict(new_trade)

@app.get("/api/trades/", response_model=List[TradeResponse])
async def get_user_trades(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    trades = conn.execute(
        "SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC", 
        (current_user['id'],)
    ).fetchall()
    conn.close()
    return [dict(trade) for trade in trades]

@app.get("/api/trades/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: int,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    trade = conn.execute(
        "SELECT * FROM trades WHERE id = ? AND user_id = ?", 
        (trade_id, current_user['id'])
    ).fetchone()
    conn.close()
    
    if not trade:
        raise HTTPException(status_code=404, detail="معامله یافت نشد")
    return dict(trade)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)