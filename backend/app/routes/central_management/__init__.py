# backend/app/routes/central_management/__init__.py
from .regular_users import router as regular_users_router
from .admin_users import router as admin_users_router
from .staff_users import router as staff_users_router

__all__ = [
    "regular_users_router",
    "admin_users_router", 
    "staff_users_router"
]