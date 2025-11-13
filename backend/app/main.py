# backend/app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import *  # Import all models for creation
from app.routes.auth import authentication
from app.routes.users import user_management
from app.routes.admin import admin_management, admin_permissions
from app.routes.audit import audit_logs
from app.core.auth import get_current_user
from app.routes.central_management.test_routes import router as test_routes_router


# Import new central management routes
from app.routes.central_management import (
    regular_users_router,
    admin_users_router, 
    staff_users_router
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ParsaGold API",
    description="سیستم مدیریت معاملات طلا، نقره و نفت",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include existing routers
app.include_router(authentication.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_management.router, prefix="/api/users", tags=["User Management"])
app.include_router(admin_management.router, prefix="/api/admin", tags=["Admin Management"])
app.include_router(admin_permissions.router, prefix="/api/admin/permissions", tags=["Admin Permissions"])
app.include_router(audit_logs.router, prefix="/api/audit", tags=["Audit Logs"])

# Include new central management routers
app.include_router(regular_users_router, prefix="/api", tags=["Central Management - Regular Users"])
app.include_router(admin_users_router, prefix="/api", tags=["Central Management - Admin Users"])
app.include_router(staff_users_router, prefix="/api", tags=["Central Management - Staff Users"])
app.include_router(test_routes_router, prefix="/api", tags=["Central Management - Test"])

@app.get("/")
async def root():
    return {"message": "ParsaGold API System", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ParsaGold API"}

@app.get("/api/test-central-users")
async def test_central_users():
    """Endpoint تست برای سیستم مرکزی کاربران"""
    return {
        "message": "سیستم مرکزی مدیریت کاربران فعال است",
        "endpoints": {
            "regular_users": "/api/central/regular-users",
            "admin_users": "/api/central/admin-users", 
            "staff_users": "/api/central/staff-users"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)