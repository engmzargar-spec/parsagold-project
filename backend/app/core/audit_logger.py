from fastapi import Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit_models import AuditLog, AuditAction
from app.models.user_models import User
from app.models.admin_models import AdminUser
import json

async def log_audit(
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    description: str = None,
    old_values: dict = None,
    new_values: dict = None,
    user_id: int = None,
    admin_user_id: int = None,
    request: Request = None,
    status_code: int = None,
    error_message: str = None
):
    """
    ثبت لاگ audit برای تمام فعالیت‌های سیستم
    """
    try:
        db = next(get_db())
        
        audit_log = AuditLog(
            action=AuditAction(action),
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
            admin_user_id=admin_user_id,
            status_code=status_code,
            error_message=error_message
        )
        
        # افزودن اطلاعات درخواست اگر موجود باشد
        if request:
            audit_log.ip_address = request.client.host
            audit_log.user_agent = request.headers.get("user-agent")
            audit_log.request_method = request.method
            audit_log.request_url = str(request.url)
        
        db.add(audit_log)
        db.commit()
        
    except Exception as e:
        # اگر خطایی در ثبت لاگ پیش آمد، سیستم نباید crash کند
        print(f"Error logging audit: {e}")
        pass

async def log_user_activity(
    user_id: int,
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    description: str = None,
    request: Request = None
):
    """
    ثبت فعالیت کاربران عادی
    """
    await log_audit(
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        user_id=user_id,
        request=request
    )

async def log_admin_activity(
    admin_user_id: int,
    action: str,
    resource_type: str = None,
    resource_id: int = None,
    description: str = None,
    old_values: dict = None,
    new_values: dict = None,
    request: Request = None
):
    """
    ثبت فعالیت ادمین‌ها
    """
    await log_audit(
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        old_values=old_values,
        new_values=new_values,
        admin_user_id=admin_user_id,
        request=request
    )

def get_audit_logs(
    db: Session,
    user_id: int = None,
    admin_user_id: int = None,
    action: str = None,
    resource_type: str = None,
    resource_id: int = None,
    limit: int = 100,
    offset: int = 0
):
    """
    دریافت لاگ‌های audit با فیلترهای مختلف
    """
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    if admin_user_id:
        query = query.filter(AuditLog.admin_user_id == admin_user_id)
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    
    if resource_id:
        query = query.filter(AuditLog.resource_id == resource_id)
    
    return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()