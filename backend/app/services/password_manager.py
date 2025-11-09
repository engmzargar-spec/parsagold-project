# backend/app/services/password_manager.py
from passlib.context import CryptContext
from enum import Enum
import logging
from typing import Optional, Dict, Any

# تنظیمات لاگینگ
logger = logging.getLogger(__name__)

class HashAlgorithm(Enum):
    """
    الگوریتم‌های هش کردن پشتیبانی شده
    """
    BCRYPT = "bcrypt"
    ARGON2 = "argon2"

class PasswordManager:
    """
    سرویس مرکزی مدیریت رمزهای عبور با پشتیبانی از چندین الگوریتم
    طراحی شده برای مقیاس‌پذیری و ارتقای آینده
    """
    
    def __init__(self, algorithm: HashAlgorithm = HashAlgorithm.BCRYPT):
        self.algorithm = algorithm
        self._setup_algorithm()
        logger.info(f"✅ PasswordManager initialized with {algorithm.value}")
    
    def _setup_algorithm(self):
        """تنظیم الگوریتم هش کردن"""
        if self.algorithm == HashAlgorithm.ARGON2:
            self._setup_argon2()
        else:
            self._setup_bcrypt()
    
    def _setup_bcrypt(self):
        """تنظیم bcrypt با پارامترهای امن"""
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=14  # افزایش امنیت نسبت به پیش‌فرض
        )
        self.algorithm_name = "bcrypt"
    
    def _setup_argon2(self):
        """تنظیم آرگون۲ با پارامترهای امن"""
        try:
            self.pwd_context = CryptContext(
                schemes=["argon2"],
                deprecated="auto",
                argon2__time_cost=3,      # تعداد iterations
                argon2__memory_cost=65536, # 64MB memory
                argon2__parallelism=1,    # تعداد threadها
                argon2__hash_len=32,      # طول هش
                argon2__salt_len=16       # طول salt
            )
            self.algorithm_name = "argon2"
        except Exception as e:
            logger.warning(f"❌ Argon2 not available, falling back to bcrypt: {e}")
            self.algorithm = HashAlgorithm.BCRYPT
            self._setup_bcrypt()
    
    def hash_password(self, password: str) -> str:
        """
        هش کردن رمز عبور با الگوریتم انتخاب شده
        
        Args:
            password: رمز عبور خام
            
        Returns:
            str: هش شده رمز عبور
        """
        try:
            if not password or len(password) < 4:
                raise ValueError("Password must be at least 4 characters long")
            
            # اعتبارسنجی اولیه
            strength_check = self.validate_password_strength(password)
            if not strength_check["is_valid"]:
                logger.warning(f"⚠️ Weak password detected: {strength_check['feedback']}")
            
            hashed = self.pwd_context.hash(password)
            logger.debug(f"🔐 Password hashed with {self.algorithm_name} (length: {len(hashed)})")
            return hashed
            
        except Exception as e:
            logger.error(f"❌ Error hashing password with {self.algorithm_name}: {e}")
            raise
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        تأیید رمز عبور با هش ذخیره شده
        از الگوریتم ذخیره شده در هش پیروی می‌کند (auto-detection)
        
        Args:
            plain_password: رمز عبور خام
            hashed_password: هش ذخیره شده در دیتابیس
            
        Returns:
            bool: True اگر رمز صحیح باشد
        """
        try:
            if not plain_password or not hashed_password:
                logger.warning("⚠️ Empty password or hash provided")
                return False
            
            # تشخیص خودکار الگوریتم از روی فرمت هش
            detected_algorithm = self._detect_hash_algorithm(hashed_password)
            
            if detected_algorithm != self.algorithm:
                logger.info(f"🔄 Hash algorithm mismatch: stored={detected_algorithm}, current={self.algorithm}")
            
            # تأیید رمز عبور (passlib به صورت خودکار الگوریتم رو تشخیص میده)
            is_valid = self.pwd_context.verify(plain_password, hashed_password)
            
            if is_valid:
                logger.debug(f"✅ Password verification successful ({detected_algorithm})")
                
                # اگر هش نیاز به بروزرسانی داره، flag بده
                if self.pwd_context.needs_update(hashed_password):
                    logger.info("🔄 Hash needs rehashing with updated parameters")
                    
            else:
                logger.warning(f"❌ Password verification failed ({detected_algorithm})")
                
            return is_valid
            
        except Exception as e:
            logger.error(f"❌ Error verifying password: {e}")
            return False
    
    def _detect_hash_algorithm(self, hashed_password: str) -> str:
        """
        تشخیص الگوریتم استفاده شده از روی فرمت هش
        
        Args:
            hashed_password: هش برای بررسی
            
        Returns:
            str: نام الگوریتم تشخیص داده شده
        """
        if hashed_password.startswith("$2b$"):
            return "bcrypt"
        elif hashed_password.startswith("$argon2"):
            return "argon2"
        else:
            return "unknown"
    
    def _is_valid_hash_format(self, hashed_password: str) -> bool:
        """
        بررسی فرمت هش
        
        Args:
            hashed_password: هش برای بررسی
            
        Returns:
            bool: True اگر فرمت معتبر باشد
        """
        return self._detect_hash_algorithm(hashed_password) != "unknown"
    
    def needs_rehash(self, hashed_password: str) -> bool:
        """
        بررسی نیاز به هش مجدد (اگر تنظیمات تغییر کرده باشد)
        
        Args:
            hashed_password: هش موجود
            
        Returns:
            bool: True اگر نیاز به هش مجدد باشد
        """
        return self.pwd_context.needs_update(hashed_password)
    
    def generate_temporary_password(self, length: int = 12) -> str:
        """
        تولید رمز عبور موقت امن
        
        Args:
            length: طول رمز عبور
            
        Returns:
            str: رمز عبور موقت
        """
        import secrets
        import string
        
        try:
            # ترکیب امن از حروف، اعداد و کاراکترهای خاص
            alphabet = string.ascii_letters + string.digits + "!@#$%"
            temporary_password = ''.join(secrets.choice(alphabet) for _ in range(length))
            
            logger.debug(f"🔑 Generated temporary password (length: {length})")
            return temporary_password
            
        except Exception as e:
            logger.error(f"❌ Error generating temporary password: {e}")
            raise
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """
        بررسی قدرت رمز عبور
        
        Args:
            password: رمز عبور برای بررسی
            
        Returns:
            dict: نتیجه بررسی با جزئیات
        """
        result = {
            "is_valid": True,
            "score": 0,
            "score_max": 5,
            "feedback": [],
            "strength": "weak"
        }
        
        checks = {
            "length": len(password) >= 8,
            "uppercase": any(c.isupper() for c in password),
            "lowercase": any(c.islower() for c in password),
            "digits": any(c.isdigit() for c in password),
            "special": any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        }
        
        # محاسبه امتیاز
        result["score"] = sum(checks.values())
        
        # پیام‌های راهنما
        if not checks["length"]:
            result["feedback"].append("رمز عبور باید حداقل ۸ کاراکتر باشد")
        if not checks["uppercase"]:
            result["feedback"].append("از حروف بزرگ استفاده کنید")
        if not checks["lowercase"]:
            result["feedback"].append("از حروف کوچک استفاده کنید")
        if not checks["digits"]:
            result["feedback"].append("از اعداد استفاده کنید")
        if not checks["special"]:
            result["feedback"].append("از کاراکترهای خاص استفاده کنید")
        
        # سطح قدرت
        if result["score"] >= 4:
            result["strength"] = "strong"
            result["is_valid"] = True
        elif result["score"] >= 3:
            result["strength"] = "medium"
            result["is_valid"] = True
        else:
            result["strength"] = "weak"
            result["is_valid"] = False
        
        return result
    
    def get_algorithm_info(self) -> Dict[str, Any]:
        """دریافت اطلاعات الگوریتم فعلی"""
        return {
            "algorithm": self.algorithm.value,
            "algorithm_name": self.algorithm_name,
            "description": "Secure password hashing service",
            "supports_argon2": self.algorithm == HashAlgorithm.ARGON2
        }

# نمونه سراسری با bcrypt (پیش‌فرض امن و پایدار)
password_manager = PasswordManager(HashAlgorithm.BCRYPT)

# نمونه جایگزین با آرگون۲ (برای استفاده آینده)
# password_manager_argon2 = PasswordManager(HashAlgorithm.ARGON2)

# توابع shortcut برای سازگاری با کد موجود
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """تابع shortcut برای سازگاری با کد موجود"""
    return password_manager.verify_password(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """تابع shortcut برای سازگاری با کد موجود"""
    return password_manager.hash_password(password)

def validate_password_strength(password: str) -> Dict[str, Any]:
    """تابع shortcut برای بررسی قدرت رمز"""
    return password_manager.validate_password_strength(password)