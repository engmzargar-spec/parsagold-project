import os
import shutil
import re
from pathlib import Path
import json
from typing import Dict, List, Set

class ProjectOrganizer:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.frontend_path = self.project_path / "frontend"
        self.backend_path = self.project_path / "backend"
        
        # Standard structure
        self.standard_structure = {
            "frontend/src/app": {
                "(admin)": ["dashboard", "users", "admins", "staff", "settings"],
                "(auth)": ["login", "register", "forgot-password", "reset-password"],
                "(user)": ["dashboard", "profile", "trades", "wallet", "security", "settings"],
                "(public)": ["pricing", "about", "contact", "faq", "test-connection"],
                "api": ["auth", "users", "trades", "market"],
            },
            "frontend/src/components": {
                "ui": ["button", "card", "input", "table", "modal"],
                "forms": ["login-form", "register-form", "trade-form", "profile-form"],
                "shared": ["header", "sidebar", "footer", "navigation"],
                "dashboard": ["stats", "charts", "tables", "widgets"],
            },
            "frontend/src/lib": {
                "utils": ["formatters", "validators", "helpers"],
                "hooks": ["auth", "api", "ui"],
                "constants": ["routes", "config", "enums"],
            },
            "backend/app": {
                "routes": ["auth", "users", "admin", "trades", "market", "audit"],
                "models": ["user", "trade", "market", "audit"],
                "services": ["auth", "trade", "notification", "report"],
                "middleware": ["auth", "validation", "logging"],
                "utils": ["database", "security", "helpers"],
            }
        }
        
        # File migration map
        self.migration_map = {
            "frontend/src/app/login": "frontend/src/app/auth/login",
            "frontend/src/app/register": "frontend/src/app/auth/register",
            "frontend/src/app/dashboard": "frontend/src/app/user/dashboard",
            "frontend/src/app/test-connection": "frontend/src/app/public/test-connection",
            "frontend/src/components/dashboard/DashboardSidebar.tsx": "frontend/src/components/shared/DashboardSidebar.tsx",
            "frontend/src/components/LivePrices.tsx": "frontend/src/components/dashboard/LivePrices.tsx",
            "backend/app/routes/central_management": "backend/app/routes/admin",
            "backend/app/routes/users/user_management.py": "backend/app/routes/users/management.py",
        }
        
        # Route updates in code
        self.route_updates = {
            "'/auth/login'": "'/auth/login'",
            '"/auth/login"': '"/auth/login"',
            "'/auth/register'": "'/auth/register'",
            '"/auth/register"': '"/auth/register"',
            "'/user/dashboard'": "'/user/dashboard'",
            '"/user/dashboard"': '"/user/dashboard"',
            "'/public/test-connection'": "'/public/test-connection'",
            '"/public/test-connection"': '"/public/test-connection"',
            "from '@/app/auth/login'": "from '@/app/auth/login'",
            "from '@/app/auth/register'": "from '@/app/auth/register'",
            "from '@/app/user/dashboard'": "from '@/app/user/dashboard'",
            "from '../auth/login'": "from '../auth/login'",
            "from '../auth/register'": "from '../auth/register'",
        }

    def analyze_current_structure(self) -> Dict:
        """Analyze current project structure"""
        print("🔍 Analyzing current project structure...")
        
        structure = {}
        
        for root, dirs, files in os.walk(self.project_path):
            if any(ignore in root for ignore in ['.next', '.git', 'node_modules', '__pycache__', '.vscode']):
                continue
                
            relative_path = str(Path(root).relative_to(self.project_path))
            structure[relative_path] = {
                'files': files,
                'dirs': dirs
            }
            
        return structure

    def create_standard_structure(self):
        """Create standard structure"""
        print("🏗️ Creating standard structure...")
        
        for base_path, structure in self.standard_structure.items():
            for folder, subfolders in structure.items():
                folder_path = self.project_path / base_path / folder
                folder_path.mkdir(parents=True, exist_ok=True)
                
                for subfolder in subfolders:
                    subfolder_path = folder_path / subfolder
                    subfolder_path.mkdir(parents=True, exist_ok=True)
                    
                    if subfolder in ['page', 'layout']:
                        (subfolder_path / 'page.tsx').touch(exist_ok=True)
                    elif subfolder.endswith('.py'):
                        (folder_path / subfolder).touch(exist_ok=True)

    def migrate_files(self):
        """Migrate files to new structure"""
        print("🚚 Migrating files...")
        
        migrated_files = []
        
        for old_path, new_path in self.migration_map.items():
            old_full_path = self.project_path / old_path
            new_full_path = self.project_path / new_path
            
            if old_full_path.exists():
                new_full_path.parent.mkdir(parents=True, exist_ok=True)
                
                if old_full_path.is_file():
                    shutil.move(str(old_full_path), str(new_full_path))
                    migrated_files.append((old_path, new_path))
                elif old_full_path.is_dir():
                    shutil.move(str(old_full_path), str(new_full_path))
                    migrated_files.append((old_path, new_path))
                    
        return migrated_files

    def update_file_references(self, file_path: Path):
        """Update references in a file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            for old_route, new_route in self.route_updates.items():
                content = content.replace(old_route, new_route)
            
            content = self.update_imports(content, file_path)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
                
        except Exception as e:
            print(f"❌ Error updating {file_path}: {e}")
            
        return False

    def update_imports(self, content: str, file_path: Path) -> str:
        """Update imports"""
        import_patterns = [
            r"from\s+['\"](\.\./)*app/(login|register|dashboard)['\"]",
            r"from\s+['\"]@/app/(login|register|dashboard)['\"]",
            r"import\s+.*from\s+['\"](\.\./)*app/(login|register|dashboard)['\"]",
        ]
        
        for pattern in import_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                old_import = match.group(0)
                if 'login' in old_import:
                    new_import = old_import.replace('app/login', 'app/auth/login')
                elif 'register' in old_import:
                    new_import = old_import.replace('app/register', 'app/auth/register')
                elif 'dashboard' in old_import:
                    new_import = old_import.replace('app/dashboard', 'app/user/dashboard')
                else:
                    continue
                    
                content = content.replace(old_import, new_import)
                
        return content

    def scan_and_update_files(self):
        """Scan and update all files"""
        print("🔧 Updating file references...")
        
        updated_files = []
        file_extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json']
        
        for root, dirs, files in os.walk(self.project_path):
            if any(ignore in root for ignore in ['.next', '.git', 'node_modules', '__pycache__', '.vscode']):
                continue
                
            for file in files:
                if any(file.endswith(ext) for ext in file_extensions):
                    file_path = Path(root) / file
                    if self.update_file_references(file_path):
                        updated_files.append(str(file_path.relative_to(self.project_path)))
                        
        return updated_files

    def remove_empty_folders(self):
        """Remove empty folders"""
        print("🧹 Removing empty folders...")
        
        removed_folders = []
        
        for root, dirs, files in os.walk(self.project_path, topdown=False):
            if any(ignore in root for ignore in ['.git', '.vscode']):
                continue
                
            try:
                if not os.listdir(root) and root != str(self.project_path):
                    os.rmdir(root)
                    removed_folders.append(root)
            except OSError:
                pass
                
        return removed_folders

    def cleanup_duplicate_files(self):
        """Cleanup duplicate and temporary files"""
        print("🗑️ Cleaning up unnecessary files...")
        
        cleanup_patterns = [
            '*.backup',
            '*.tmp',
            '*.temp',
            '*_old.*',
            '*_backup.*',
            'test_*.py',
            'debug_*.py',
            'fix_*.py',
        ]
        
        cleaned_files = []
        
        for pattern in cleanup_patterns:
            for file_path in self.project_path.rglob(pattern):
                try:
                    file_path.unlink()
                    cleaned_files.append(str(file_path.relative_to(self.project_path)))
                except Exception as e:
                    print(f"❌ Error deleting {file_path}: {e}")
                    
        return cleaned_files

    def generate_structure_report(self):
        """Generate final structure report"""
        print("📊 Generating final report...")
        
        report = {
            'project_path': str(self.project_path),
            'frontend_structure': {},
            'backend_structure': {},
            'migration_summary': {
                'files_migrated': 0,
                'files_updated': 0,
                'folders_removed': 0,
                'files_cleaned': 0
            }
        }
        
        frontend_app_path = self.frontend_path / "src" / "app"
        if frontend_app_path.exists():
            for item in frontend_app_path.iterdir():
                if item.is_dir():
                    report['frontend_structure'][item.name] = [
                        sub.name for sub in item.iterdir() if sub.is_dir()
                    ]
        
        backend_app_path = self.backend_path / "app"
        if backend_app_path.exists():
            for item in backend_app_path.iterdir():
                if item.is_dir():
                    report['backend_structure'][item.name] = [
                        sub.name for sub in item.iterdir() if sub.is_dir()
                    ]
        
        return report

    def organize_project(self):
        """Main function to organize the project"""
        print("🚀 Starting comprehensive organization of parsagold-project...")
        print("=" * 60)
        
        try:
            current_structure = self.analyze_current_structure()
            print(f"✅ Current structure analyzed ({len(current_structure)} folders)")
            
            self.create_standard_structure()
            print("✅ Standard structure created")
            
            migrated_files = self.migrate_files()
            print(f"✅ {len(migrated_files)} files migrated")
            
            updated_files = self.scan_and_update_files()
            print(f"✅ {len(updated_files)} files updated")
            
            cleaned_files = self.cleanup_duplicate_files()
            removed_folders = self.remove_empty_folders()
            print(f"✅ {len(cleaned_files)} files and {len(removed_folders)} folders cleaned")
            
            final_report = self.generate_structure_report()
            final_report['migration_summary'] = {
                'files_migrated': len(migrated_files),
                'files_updated': len(updated_files),
                'folders_removed': len(removed_folders),
                'files_cleaned': len(cleaned_files)
            }
            
            print("\n" + "=" * 60)
            print("🎉 Project organization completed successfully!")
            print("=" * 60)
            
            self.print_final_report(final_report, migrated_files, updated_files)
            
            return final_report
            
        except Exception as e:
            print(f"❌ Error organizing project: {e}")
            return None

    def print_final_report(self, report, migrated_files, updated_files):
        """Print final report"""
        print("\n📋 Final Organization Report:")
        print("-" * 40)
        
        print(f"📁 Project Path: {report['project_path']}")
        print(f"📊 Change Statistics:")
        print(f"   • Files Migrated: {report['migration_summary']['files_migrated']}")
        print(f"   • Files Updated: {report['migration_summary']['files_updated']}")
        print(f"   • Folders Removed: {report['migration_summary']['folders_removed']}")
        print(f"   • Files Cleaned: {report['migration_summary']['files_cleaned']}")
        
        print("\n🏗️ Final Frontend Structure:")
        for folder, subfolders in report['frontend_structure'].items():
            print(f"   📂 {folder}/")
            for subfolder in subfolders:
                print(f"      📁 {subfolder}/")
        
        print("\n⚙️ Final Backend Structure:")
        for folder, subfolders in report['backend_structure'].items():
            print(f"   📂 {folder}/")
            for subfolder in subfolders:
                print(f"      📁 {subfolder}/")
        
        if migrated_files:
            print("\n🚚 Migrated Files:")
            for old, new in migrated_files[:10]:
                print(f"   • {old} → {new}")
            if len(migrated_files) > 10:
                print(f"   ... and {len(migrated_files) - 10} more")

def main():
    """Main execution function"""
    project_path = input("🔹 Enter the full path to parsagold-project: ").strip()
    
    if not project_path:
        project_path = "D:/parsagold-project"
    
    if not os.path.exists(project_path):
        print(f"❌ Path {project_path} does not exist!")
        return
    
    print(f"🎯 Project identified: {project_path}")
    
    confirmation = input("⚠️ Are you sure you want to organize the project? (y/n): ")
    if confirmation.lower() != 'y':
        print("❌ Organization cancelled.")
        return
    
    organizer = ProjectOrganizer(project_path)
    result = organizer.organize_project()
    
    if result:
        print("\n✅ Organization completed successfully!")
        print("🎯 Project now has standard structure.")
    else:
        print("\n❌ An error occurred during organization!")

if __name__ == "__main__":
    main()