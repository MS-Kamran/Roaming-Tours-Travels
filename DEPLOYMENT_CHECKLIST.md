# cPanel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Files Ready for Upload
- [ ] `passenger_wsgi.py` - WSGI entry point
- [ ] `app.py` - Main Flask application
- [ ] `custom_qr_style.py` - QR code styling
- [ ] `requirements.txt` - Dependencies with versions
- [ ] `.htaccess` - Apache configuration
- [ ] `static/` folder - CSS, JS, images
- [ ] `templates/` folder - HTML templates
- [ ] `CPANEL_DEPLOYMENT.md` - Deployment guide

### ✅ Configuration Updates Needed
- [ ] Update `.htaccess` with correct paths:
  - Replace `yourusername` with your cPanel username
  - Replace `your-app-folder` with actual folder name
- [ ] Verify Python version compatibility (3.8+)

## Deployment Steps

### 1. Upload Files
- [ ] Log into cPanel
- [ ] Open File Manager
- [ ] Navigate to `public_html` or domain folder
- [ ] Upload all files (except `data/` folder)
- [ ] Extract if uploaded as ZIP

### 2. Python Environment Setup
- [ ] Find "Python App" in cPanel
- [ ] Create new Python application
- [ ] Set Python version (3.8+)
- [ ] Set application root path
- [ ] Set startup file: `passenger_wsgi.py`

### 3. Install Dependencies
- [ ] Open Python App terminal
- [ ] Run: `pip install -r requirements.txt`
- [ ] Verify all packages installed successfully

### 4. File Permissions
- [ ] Set `passenger_wsgi.py` to 755
- [ ] Set `app.py` to 644
- [ ] Set `static/` folder to 755
- [ ] Set `templates/` folder to 755
- [ ] Create `data/` folder with 755 permissions
- [ ] Create `data/backups/` folder with 755 permissions

### 5. Configuration Updates
- [ ] Edit `.htaccess` with correct paths
- [ ] Verify PassengerAppRoot path
- [ ] Check Python path if needed

## Post-Deployment Testing

### ✅ Basic Functionality
- [ ] Visit your domain - homepage loads
- [ ] Test QR code generation
- [ ] Test URL shortening
- [ ] Test shortened URL redirection
- [ ] Check `/health` endpoint
- [ ] Test management interface

### ✅ Error Handling
- [ ] Test 404 pages
- [ ] Verify error logs in cPanel
- [ ] Check static file loading

## Troubleshooting Quick Fixes

### 500 Internal Server Error
1. Check error logs in cPanel
2. Verify file permissions
3. Check `.htaccess` syntax
4. Ensure all dependencies installed

### Module Not Found
1. Reinstall requirements: `pip install -r requirements.txt`
2. Check Python version compatibility
3. Verify virtual environment if used

### Static Files Not Loading
1. Check static folder permissions (755)
2. Verify `.htaccess` static file rules
3. Clear browser cache

### Data Directory Issues
1. Create `data/` folder manually
2. Set permissions to 755
3. Create `backups/` subfolder

## Security Verification

- [ ] `.env` files are protected
- [ ] `data/` directory is protected
- [ ] Python files are protected (except `passenger_wsgi.py`)
- [ ] Error pages don't expose sensitive information

## Performance Checks

- [ ] Static file caching working
- [ ] Gzip compression enabled
- [ ] Page load times acceptable
- [ ] Health check endpoint responding

## Final Steps

- [ ] Document your domain/subdomain URL
- [ ] Save cPanel login details securely
- [ ] Set up monitoring if needed
- [ ] Plan for regular backups
- [ ] Schedule dependency updates

---

**Success Indicators:**
- Homepage loads without errors
- QR codes generate and download
- URL shortening works
- Health check returns 200 status
- No errors in cPanel error logs

**Support Resources:**
- Namecheap Python hosting documentation
- Flask deployment guides
- cPanel Python app tutorials