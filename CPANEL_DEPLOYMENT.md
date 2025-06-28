# Namecheap cPanel Deployment Guide

This guide will help you deploy your Roaming Tours & Travels Flask application to Namecheap shared hosting using cPanel.

## Prerequisites

- Namecheap shared hosting account with Python support
- cPanel access
- FTP/File Manager access

## Step 1: Prepare Your Files

Ensure you have these files ready for upload:

```
├── passenger_wsgi.py      # WSGI entry point (created)
├── app.py                 # Main Flask application
├── custom_qr_style.py     # QR code styling
├── requirements.txt       # Python dependencies
├── .htaccess             # Apache configuration (created)
├── static/               # CSS, JS, images
├── templates/            # HTML templates
└── data/                 # Data storage (will be created)
```

## Step 2: Upload Files to cPanel

### Option A: Using File Manager
1. Log into your cPanel
2. Open **File Manager**
3. Navigate to `public_html` (or your domain's folder)
4. Upload all files except the `data/` folder
5. Extract if you uploaded a ZIP file

### Option B: Using FTP
1. Use an FTP client (FileZilla, WinSCP, etc.)
2. Connect to your hosting account
3. Upload all files to the `public_html` directory

## Step 3: Configure Python Environment

1. In cPanel, find **Python App** or **Setup Python App**
2. Create a new Python application:
   - **Python Version**: 3.8 or higher
   - **Application Root**: `/public_html` (or your app folder)
   - **Application URL**: Your domain or subdomain
   - **Application Startup File**: `passenger_wsgi.py`

## Step 4: Install Dependencies

1. In the Python App interface, open the **Terminal** or use **pip install**
2. Run the following commands:

```bash
pip install Flask
pip install qrcode[pil]
pip install Pillow
pip install gunicorn
```

Or install from requirements.txt:
```bash
pip install -r requirements.txt
```

## Step 5: Update .htaccess Configuration

1. Edit the `.htaccess` file in your domain folder
2. Update the paths to match your hosting setup:

```apache
# Update this line with your actual path
PassengerAppRoot /home/yourusername/public_html/your-app-folder
```

Replace:
- `yourusername` with your cPanel username
- `your-app-folder` with your actual folder name

## Step 6: Set File Permissions

1. In File Manager, select the following and set permissions:
   - `passenger_wsgi.py`: 755
   - `app.py`: 644
   - `static/` folder: 755
   - `templates/` folder: 755

## Step 7: Create Data Directory

1. Create a `data` folder in your application directory
2. Set permissions to 755
3. Create a `backups` subfolder with 755 permissions

## Step 8: Test Your Application

1. Visit your domain in a web browser
2. Check if the application loads correctly
3. Test QR code generation functionality
4. Verify URL shortening works

## Troubleshooting

### Common Issues:

**1. 500 Internal Server Error**
- Check error logs in cPanel
- Verify file permissions
- Ensure Python version compatibility

**2. Module Not Found Errors**
- Reinstall dependencies using pip
- Check Python path in .htaccess

**3. File Permission Errors**
- Set correct permissions (755 for directories, 644 for files)
- Ensure data directory is writable

**4. Static Files Not Loading**
- Check static folder permissions
- Verify .htaccess static file rules

### Error Log Locations:
- cPanel → Error Logs
- `/home/username/logs/`

## Security Considerations

1. **Environment Variables**: Set production environment variables in cPanel
2. **Data Protection**: The `.htaccess` file protects sensitive directories
3. **File Permissions**: Follow the principle of least privilege
4. **Regular Backups**: Set up automatic backups in cPanel

## Performance Optimization

1. **Caching**: Static file caching is enabled in `.htaccess`
2. **Compression**: Gzip compression is configured
3. **Database**: Consider upgrading to a proper database for production

## Maintenance

1. **Updates**: Regularly update dependencies
2. **Monitoring**: Check error logs periodically
3. **Backups**: The app creates automatic backups in the `data/backups/` folder
4. **Analytics**: Monitor usage through the built-in analytics

## Support

If you encounter issues:
1. Check Namecheap's Python hosting documentation
2. Contact Namecheap support for hosting-specific issues
3. Review Flask deployment best practices

---

**Note**: This application is now configured to work in production mode when deployed to cPanel hosting. The data persistence and file handling have been optimized for shared hosting environments.