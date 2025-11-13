#!/usr/bin/env python3
"""
تست سیستم امنیت پیشرفته پارساگلد
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.security.core.hashing import password_manager, HashAlgorithm
from app.security.core.encryption import encryption_service

def test_advanced_security():
    print("🔒 Testing Advanced Security System...\n")
    
    # تست Password Manager
    print("1. Testing Password Manager:")
    print("-" * 40)
    
    # تست رمزهای معتبر
    valid_passwords = [
        "MyStrongPassword123!",
        "Another@SecurePass456",
        "Test#2024Secure$"
    ]
    
    for pwd in valid_passwords:
        is_valid, message = password_manager.validate_password_policy(pwd)
        strength = password_manager.get_password_strength_score(pwd)
        print(f"✓ {pwd}: {is_valid} - {message}")
        print(f"  Strength: {strength['strength']} (Score: {strength['score']}/5)")
    
    # تست رمزهای نامعتبر
    invalid_passwords = [
        "123456",  # رایج
        "password",  # رایج
        "abc",  # کوتاه
        "nocaps123",  # بدون حروف بزرگ
        "NOLOWERCASE123",  # بدون حروف کوچک
        "NoNumbersHere!",  # بدون اعداد
        "Simple123"  # توالی ساده
    ]
    
    print("\n2. Testing Invalid Passwords:")
    print("-" * 40)
    for pwd in invalid_passwords:
        is_valid, message = password_manager.validate_password_policy(pwd)
        print(f"✗ {pwd}: {is_valid} - {message}")
    
    # تست هش کردن و بررسی
    print("\n3. Testing Hashing & Verification:")
    print("-" * 40)
    test_password = "Secure@Password123"
    hashed, algo = password_manager.hash_password(test_password)
    is_verified = password_manager.verify_password(test_password, hashed, algo)
    print(f"Password: {test_password}")
    print(f"Hashed: {hashed[:50]}...")
    print(f"Algorithm: {algo}")
    print(f"Verified: {is_verified}")
    
    # تست رمزنگاری
    print("\n4. Testing Encryption:")
    print("-" * 40)
    sensitive_data = "SuperSecretBankAccount12345"
    encrypted = encryption_service.encrypt_data(sensitive_data)
    decrypted = encryption_service.decrypt_data(encrypted)
    print(f"Original: {sensitive_data}")
    print(f"Encrypted: {encrypted[:50]}...")
    print(f"Decrypted: {decrypted}")
    print(f"Success: {sensitive_data == decrypted}")
    
    # تست تولید رمز قوی
    print("\n5. Testing Strong Password Generation:")
    print("-" * 40)
    for i in range(3):
        strong_pwd = password_manager.generate_strong_password(16)
        is_valid, message = password_manager.validate_password_policy(strong_pwd)
        strength = password_manager.get_password_strength_score(strong_pwd)
        print(f"Generated {i+1}: {strong_pwd}")
        print(f"  Valid: {is_valid}, Strength: {strength['strength']}")

if __name__ == "__main__":
    test_advanced_security()