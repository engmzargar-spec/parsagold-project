from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from typing import Optional

class DataEncryptionService:
    def __init__(self, secret_key: Optional[str] = None):
        if secret_key:
            self.secret_key = secret_key.encode()
        else:
            # استفاده از environment variable یا کلید پیش‌فرض
            self.secret_key = os.getenv(
                "PARSAGOLD_ENCRYPTION_KEY", 
                "parsagold-default-encryption-key-2024"
            ).encode()
        
        self.fernet = self._create_fernet()
    
    def _create_fernet(self) -> Fernet:
        """ایجاد Fernet instance از secret key"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"parsagold_fixed_salt",  # در production از salt تصادفی استفاده شود
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.secret_key))
        return Fernet(key)
    
    def encrypt_data(self, data: str) -> str:
        """رمزنگاری داده‌های حساس"""
        encrypted_data = self.fernet.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """رمزگشایی داده‌های حساس"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = self.fernet.decrypt(encrypted_bytes)
            return decrypted_data.decode()
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    def encrypt_sensitive_field(self, field_value: str, field_name: str) -> dict:
        """رمزنگاری فیلدهای حساس با متادیتا"""
        encrypted_value = self.encrypt_data(field_value)
        return {
            "encrypted_value": encrypted_value,
            "field_name": field_name,
            "encryption_type": "fernet_aes",
            "version": "1.0"
        }
    
    def decrypt_sensitive_field(self, encrypted_data: dict) -> str:
        """رمزگشایی فیلدهای حساس"""
        if encrypted_data.get("encryption_type") != "fernet_aes":
            raise ValueError("Unsupported encryption type")
        
        return self.decrypt_data(encrypted_data["encrypted_value"])

# نمونه global برای استفاده در سراسر برنامه
encryption_service = DataEncryptionService()