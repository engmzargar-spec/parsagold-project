from enum import Enum
from passlib.context import CryptContext
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import secrets
import string
from typing import Tuple, Dict, Any
import re

class HashAlgorithm(Enum):
    BCRYPT = "bcrypt"
    ARGON2 = "argon2"

class AdvancedPasswordManager:
    def __init__(self, default_algorithm: HashAlgorithm = HashAlgorithm.BCRYPT):
        self.default_algorithm = default_algorithm
        
        # تنظیم context برای الگوریتم‌های مختلف
        self.bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.argon2_hasher = PasswordHasher()
        
        # سیاست‌های رمز عبور پیشرفته
        self.password_policies = {
            "min_length": 8,
            "max_length": 128,
            "require_uppercase": True,
            "require_lowercase": True,
            "require_numbers": True,
            "require_special_chars": True,
            "block_common_passwords": True,
            "max_age_days": 90,  # تغییر هر ۳ ماه
        }
        
        # لیست رمزهای عبور رایج (برای مسدودسازی)
        self.common_passwords = {
            "123456", "password", "12345678", "qwerty", "123456789",
            "12345", "1234", "111111", "1234567", "dragon",
            "123123", "baseball", "abc123", "football", "monkey",
            "letmein", "696969", "shadow", "master", "666666",
            "qwertyuiop", "123321", "mustang", "1234567890",
            "password1", "123456a", "parsagold", "admin", "mezr"
        }
    
    def hash_password(self, password: str, algorithm: HashAlgorithm = None) -> Tuple[str, str]:
        """هش کردن رمز عبور با مشخص کردن الگوریتم"""
        # اعتبارسنجی اولیه
        is_valid, message = self.validate_password_policy(password)
        if not is_valid:
            raise ValueError(f"Password policy violation: {message}")
            
        algo = algorithm or self.default_algorithm
        
        if algo == HashAlgorithm.BCRYPT:
            hashed = self.bcrypt_context.hash(password)
            return hashed, HashAlgorithm.BCRYPT.value
        elif algo == HashAlgorithm.ARGON2:
            hashed = self.argon2_hasher.hash(password)
            return hashed, HashAlgorithm.ARGON2.value
        else:
            raise ValueError(f"Algorithm {algo} not supported")
    
    def verify_password(self, plain_password: str, hashed_password: str, algorithm: str) -> bool:
        """بررسی تطابق رمز عبور"""
        try:
            if algorithm == HashAlgorithm.BCRYPT.value:
                return self.bcrypt_context.verify(plain_password, hashed_password)
            elif algorithm == HashAlgorithm.ARGON2.value:
                self.argon2_hasher.verify(hashed_password, plain_password)
                return True
            else:
                return False
        except (ValueError, VerifyMismatchError):
            return False
    
    def validate_password_policy(self, password: str) -> Tuple[bool, str]:
        """بررسی انطباق رمز عبور با سیاست‌های پیشرفته"""
        policies = self.password_policies
        
        # بررسی طول
        if len(password) < policies["min_length"]:
            return False, f"Password must be at least {policies['min_length']} characters long"
        
        if len(password) > policies["max_length"]:
            return False, f"Password must be at most {policies['max_length']} characters long"
        
        # بررسی کاراکترهای لازم
        if policies["require_uppercase"] and not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        if policies["require_lowercase"] and not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        if policies["require_numbers"] and not any(c.isdigit() for c in password):
            return False, "Password must contain at least one number"
        
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if policies["require_special_chars"] and not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character"
        
        # بررسی رمزهای رایج
        if policies["block_common_passwords"] and password.lower() in self.common_passwords:
            return False, "Password is too common and not allowed"
        
        # بررسی توالی‌های ساده
        if self._has_simple_sequence(password):
            return False, "Password contains simple sequences which are not allowed"
        
        return True, "Password meets all policy requirements"
    
    def _has_simple_sequence(self, password: str) -> bool:
        """بررسی توالی‌های ساده مانند 123, abc, etc."""
        sequences = [
            "123", "234", "345", "456", "567", "678", "789",
            "abc", "bcd", "cde", "def", "efg", "fgh", "ghi", 
            "jkl", "mno", "pqr", "stu", "vwx", "yz",
            "qwerty", "asdfgh", "zxcvbn"
        ]
        
        password_lower = password.lower()
        return any(seq in password_lower for seq in sequences)
    
    def generate_strong_password(self, length: int = 12) -> str:
        """تولید رمز عبور قوی که با تمام سیاست‌ها مطابقت دارد"""
        if length < self.password_policies["min_length"]:
            length = self.password_policies["min_length"]
            
        uppercase = string.ascii_uppercase
        lowercase = string.ascii_lowercase
        digits = string.digits
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        # اطمینان از وجود تمام کاراکترهای required
        password = [
            secrets.choice(uppercase),
            secrets.choice(lowercase),
            secrets.choice(digits),
            secrets.choice(special_chars)
        ]
        
        # پر کردن بقیه رمز
        all_chars = uppercase + lowercase + digits + special_chars
        password += [secrets.choice(all_chars) for _ in range(length - 4)]
        
        # مخلوط کردن کاراکترها
        secrets.SystemRandom().shuffle(password)
        
        final_password = ''.join(password)
        
        # اطمینان از مطابقت با سیاست‌ها
        is_valid, message = self.validate_password_policy(final_password)
        if not is_valid:
            # اگر تولید شده معتبر نبود، دوباره تولید کن
            return self.generate_strong_password(length)
        
        return final_password
    
    def get_password_strength_score(self, password: str) -> Dict[str, Any]:
        """امتیازدهی قدرت رمز عبور"""
        score = 0
        feedback = []
        
        # طول
        if len(password) >= 12:
            score += 2
            feedback.append("✓ Good length")
        elif len(password) >= 8:
            score += 1
            feedback.append("✓ Acceptable length")
        else:
            feedback.append("✗ Too short")
        
        # تنوع کاراکتر
        criteria_met = 0
        if any(c.isupper() for c in password):
            criteria_met += 1
        if any(c.islower() for c in password):
            criteria_met += 1
        if any(c.isdigit() for c in password):
            criteria_met += 1
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            criteria_met += 1
        
        if criteria_met == 4:
            score += 2
            feedback.append("✓ Excellent character variety")
        elif criteria_met >= 3:
            score += 1
            feedback.append("✓ Good character variety")
        else:
            feedback.append("✗ Poor character variety")
        
        # پیچیدگی
        if len(password) >= 16 and criteria_met == 4:
            score += 1
            feedback.append("✓ High complexity")
        
        # تعیین سطح
        if score >= 4:
            strength = "Very Strong"
        elif score >= 3:
            strength = "Strong"
        elif score >= 2:
            strength = "Moderate"
        else:
            strength = "Weak"
        
        return {
            "score": score,
            "strength": strength,
            "max_score": 5,
            "feedback": feedback
        }

# نمونه global برای استفاده در سراسر برنامه
password_manager = AdvancedPasswordManager(HashAlgorithm.BCRYPT)