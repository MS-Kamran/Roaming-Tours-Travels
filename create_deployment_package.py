#!/usr/bin/env python3
"""
Script to create a deployment package for cPanel hosting
This script creates a ZIP file with all necessary files for deployment
"""

import os
import zipfile
import shutil
from datetime import datetime

def create_deployment_package():
    """Create a ZIP file with all deployment files"""
    
    # Files and folders to include in deployment
    files_to_include = [
        'passenger_wsgi.py',
        'app.py',
        'custom_qr_style.py',
        'requirements.txt',
        '.htaccess',
        'CPANEL_DEPLOYMENT.md',
        'DEPLOYMENT_CHECKLIST.md'
    ]
    
    folders_to_include = [
        'static',
        'templates'
    ]
    
    # Create deployment package name with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    package_name = f'roaming_tours_deployment_{timestamp}.zip'
    
    print(f"Creating deployment package: {package_name}")
    
    try:
        with zipfile.ZipFile(package_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add individual files
            for file in files_to_include:
                if os.path.exists(file):
                    zipf.write(file)
                    print(f"Added: {file}")
                else:
                    print(f"Warning: {file} not found")
            
            # Add folders and their contents
            for folder in folders_to_include:
                if os.path.exists(folder):
                    for root, dirs, files in os.walk(folder):
                        for file in files:
                            file_path = os.path.join(root, file)
                            zipf.write(file_path)
                            print(f"Added: {file_path}")
                else:
                    print(f"Warning: {folder} folder not found")
        
        print(f"\n✅ Deployment package created successfully: {package_name}")
        print(f"📦 Package size: {os.path.getsize(package_name) / 1024:.1f} KB")
        
        print("\n📋 Next steps:")
        print("1. Upload this ZIP file to your cPanel File Manager")
        print("2. Extract it in your domain's public_html folder")
        print("3. Follow the CPANEL_DEPLOYMENT.md guide")
        print("4. Use DEPLOYMENT_CHECKLIST.md to verify everything")
        
        return package_name
        
    except Exception as e:
        print(f"❌ Error creating deployment package: {e}")
        return None

def verify_files():
    """Verify all required files exist before packaging"""
    required_files = [
        'passenger_wsgi.py',
        'app.py',
        'custom_qr_style.py',
        'requirements.txt',
        '.htaccess'
    ]
    
    required_folders = [
        'static',
        'templates'
    ]
    
    missing_files = []
    missing_folders = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    for folder in required_folders:
        if not os.path.exists(folder):
            missing_folders.append(folder)
    
    if missing_files or missing_folders:
        print("❌ Missing required files/folders:")
        for file in missing_files:
            print(f"  - {file}")
        for folder in missing_folders:
            print(f"  - {folder}/")
        return False
    
    print("✅ All required files and folders found")
    return True

if __name__ == '__main__':
    print("🚀 Roaming Tours & Travels - Deployment Package Creator")
    print("=" * 55)
    
    # Verify files exist
    if verify_files():
        # Create deployment package
        package = create_deployment_package()
        
        if package:
            print(f"\n🎉 Ready for deployment!")
            print(f"📁 Package location: {os.path.abspath(package)}")
    else:
        print("\n❌ Cannot create package - missing required files")
        print("Please ensure all files are present and try again")