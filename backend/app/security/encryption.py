from cryptography.fernet import Fernet
import hashlib
import os
import base64
from dotenv import load_dotenv

# لود کردن environment variables
load_dotenv()

class DataEncryption:
    def __init__(self):
        self.key = os.getenv('ENCRYPTION_KEY')
        if not self.key:
            raise ValueError("ENCRYPTION_KEY not found in environment variables")
        self.fernet = Fernet(self.key.encode())
    
    def encrypt_data(self, data: str) -> str:
        """رمزنگاری داده‌های حساس"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """رمزگشایی داده‌ها"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()
    
    @staticmethod
    def generate_key():
        """تولید کلید جدید برای ENCRYPTION_KEY"""
        return Fernet.generate_key().decode()

class HashService:
    @staticmethod
    def hash_password(password: str) -> str:
        """هش کردن رمز عبور با salt"""
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            100000
        )
        return base64.b64encode(salt + key).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """بررسی تطابق رمز عبور با هش"""
        try:
            decoded = base64.b64decode(hashed.encode('utf-8'))
            salt = decoded[:32]
            stored_key = decoded[32:]
            key = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt,
                100000
            )
            return stored_key == key
        except Exception:
            return False