from passlib.context import CryptContext

# استفاده از pbkdf2_sha256 که مشکل bcrypt رو نداره
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    # این تابع رو موقتاً ساده می‌کنیم
    import json
    import base64
    data_str = json.dumps(data)
    return base64.b64encode(data_str.encode()).decode()

def verify_token(token: str):
    # موقتاً ساده
    import json
    import base64
    try:
        data_str = base64.b64decode(token).decode()
        return json.loads(data_str)
    except:
        return None