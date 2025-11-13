from app.security.core.hashing import password_manager, HashAlgorithm
from app.security.core.encryption import encryption_service

def test_security_system():
    print("🧪 Testing Advanced Security System...")
    
    # تست Password Manager
    password = "MyStrongPassword123!"
    is_valid, message = password_manager.validate_password_policy(password)
    print(f"Password Policy Test: {is_valid} - {message}")
    
    # تست هش کردن
    hashed, algo = password_manager.hash_password(password, HashAlgorithm.BCRYPT)
    print(f"Hashing Test: {algo} - {hashed}")
    
    # تست بررسی رمز
    is_verified = password_manager.verify_password(password, hashed, algo)
    print(f"Verification Test: {is_verified}")
    
    # تست رمزنگاری
    sensitive_data = "SuperSecretBankAccount123"
    encrypted = encryption_service.encrypt_data(sensitive_data)
    decrypted = encryption_service.decrypt_data(encrypted)
    print(f"Encryption Test: {sensitive_data} -> {encrypted} -> {decrypted}")
    print(f"Encryption Success: {sensitive_data == decrypted}")

if __name__ == "__main__":
    test_security_system()