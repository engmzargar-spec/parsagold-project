from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.core.auth import get_current_admin
from app.core.permissions import require_permission
from app.core.audit_logger import get_audit_logs
from app.models.audit_models import AuditLog, AuditAction
from app.models.admin_models import AdminUser

router = APIRouter()

@router.get("/", response_model=List[dict])
@require_permission("audit:read")
async def get_audit_logs_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = None,
    admin_user_id: Optional[int] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لاگ‌های audit با قابلیت فیلتر پیشرفته
    """
    # تبدیل تاریخ‌ها
    start_datetime = None
    end_datetime = None
    
    if start_date:
        try:
            start_datetime = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use ISO format."
            )
    
    if end_date:
        try:
            end_datetime = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use ISO format."
            )
    
    # ساخت کوئری پایه
    query = db.query(AuditLog)
    
    # اعمال فیلترها
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    if admin_user_id:
        query = query.filter(AuditLog.admin_user_id == admin_user_id)
    
    if action:
        try:
            audit_action = AuditAction(action)
            query = query.filter(AuditLog.action == audit_action)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action: {action}. Valid actions: {[a.value for a in AuditAction]}"
            )
    
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    
    if resource_id:
        query = query.filter(AuditLog.resource_id == resource_id)
    
    if start_datetime:
        query = query.filter(AuditLog.created_at >= start_datetime)
    
    if end_datetime:
        query = query.filter(AuditLog.created_at <= end_datetime)
    
    # دریافت نتایج
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "action": log.action.value,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "description": log.description,
            "user_id": log.user_id,
            "admin_user_id": log.admin_user_id,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "request_method": log.request_method,
            "request_url": log.request_url,
            "status_code": log.status_code,
            "error_message": log.error_message,
            "old_values": log.old_values,
            "new_values": log.new_values,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]

@router.get("/stats")
@require_permission("audit:read")
async def get_audit_stats(
    days: int = Query(7, ge=1, le=365),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت آمار لاگ‌های سیستم
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # تعداد کل لاگ‌ها
    total_logs = db.query(AuditLog).filter(AuditLog.created_at >= start_date).count()
    
    # تعداد لاگ‌ها بر اساس action
    action_stats = db.query(
        AuditLog.action, 
        db.func.count(AuditLog.id)
    ).filter(
        AuditLog.created_at >= start_date
    ).group_by(
        AuditLog.action
    ).all()
    
    # تعداد لاگ‌ها بر اساس resource_type
    resource_stats = db.query(
        AuditLog.resource_type,
        db.func.count(AuditLog.id)
    ).filter(
        AuditLog.created_at >= start_date
    ).group_by(
        AuditLog.resource_type
    ).all()
    
    # لاگ‌های خطا
    error_logs = db.query(AuditLog).filter(
        AuditLog.created_at >= start_date,
        AuditLog.status_code >= 400
    ).count()
    
    return {
        "period_days": days,
        "start_date": start_date.isoformat(),
        "total_logs": total_logs,
        "error_logs": error_logs,
        "action_stats": {
            action.value: count for action, count in action_stats
        },
        "resource_stats": {
            resource_type: count for resource_type, count in resource_stats
        }
    }

@router.get("/user/{user_id}")
@require_permission("audit:read")
async def get_user_audit_logs(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لاگ‌های مربوط به یک کاربر خاص
    """
    logs = db.query(AuditLog).filter(
        AuditLog.user_id == user_id
    ).order_by(
        AuditLog.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "action": log.action.value,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "description": log.description,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "ip_address": log.ip_address
        }
        for log in logs
    ]

@router.get("/admin/{admin_id}")
@require_permission("audit:read")
async def get_admin_audit_logs(
    admin_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لاگ‌های مربوط به یک ادمین خاص
    """
    logs = db.query(AuditLog).filter(
        AuditLog.admin_user_id == admin_id
    ).order_by(
        AuditLog.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "action": log.action.value,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "description": log.description,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "ip_address": log.ip_address
        }
        for log in logs
    ]