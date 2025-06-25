import os
import string
import random
import os
import json
from flask import Flask, request, redirect, render_template, send_file, url_for, jsonify
import qrcode
import qrcode.constants
from io import BytesIO
from custom_qr_style import create_styled_qr
from datetime import datetime

app = Flask(__name__)

# Configure Flask for production deployment
if IS_PRODUCTION:
    # Set preferred URL scheme for external URLs
    app.config['PREFERRED_URL_SCHEME'] = 'https'
    # Allow Flask to generate external URLs properly on Render
    app.config['SERVER_NAME'] = None  # Let Render handle this

# Data storage files
DB_FILE = 'data/db.json'
QR_STORAGE_FILE = 'data/qr_storage.json'
ANALYTICS_FILE = 'data/analytics.json'

# Environment configuration
IS_PRODUCTION = os.environ.get('RENDER') is not None or os.environ.get('PRODUCTION') == 'true'

# In-memory store for short links with metadata
db = {}
# Store QR code metadata
qr_storage = {}
# Store analytics data
analytics_data = {
    'page_views': 0,
    'qr_generations': 0,
    'downloads': 0,
    'system_stats': []
}

# Data persistence functions
def ensure_data_directory():
    """Ensure the data directory exists"""
    if not IS_PRODUCTION and not os.path.exists('data'):
        os.makedirs('data')

def load_data():
    """Load data from JSON files"""
    global db, qr_storage, analytics_data
    
    if IS_PRODUCTION:
        print("Running in production mode - using in-memory storage only")
        db = {}
        qr_storage = {}
        analytics_data = {
            'page_views': 0,
            'qr_generations': 0,
            'downloads': 0,
            'system_stats': []
        }
        return
    
    ensure_data_directory()
    
    # Load URL database
    try:
        if os.path.exists(DB_FILE):
            with open(DB_FILE, 'r') as f:
                db = json.load(f)
    except Exception as e:
        print(f"Error loading database: {e}")
        db = {}
    
    # Load QR storage
    try:
        if os.path.exists(QR_STORAGE_FILE):
            with open(QR_STORAGE_FILE, 'r') as f:
                qr_storage = json.load(f)
    except Exception as e:
        print(f"Error loading QR storage: {e}")
        qr_storage = {}
    
    # Load analytics data
    try:
        if os.path.exists(ANALYTICS_FILE):
            with open(ANALYTICS_FILE, 'r') as f:
                analytics_data = json.load(f)
    except Exception as e:
        print(f"Error loading analytics: {e}")
        analytics_data = {
            'page_views': 0,
            'qr_generations': 0,
            'downloads': 0,
            'system_stats': []
        }

def save_data():
    """Save data to JSON files"""
    if IS_PRODUCTION:
        # Skip file operations in production (ephemeral storage)
        return
        
    ensure_data_directory()
    
    # Save URL database
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"Error saving database: {e}")
    
    # Save QR storage
    try:
        with open(QR_STORAGE_FILE, 'w') as f:
            json.dump(qr_storage, f, indent=2)
    except Exception as e:
        print(f"Error saving QR storage: {e}")
    
    # Save analytics data
    try:
        with open(ANALYTICS_FILE, 'w') as f:
            json.dump(analytics_data, f, indent=2)
    except Exception as e:
        print(f"Error saving analytics: {e}")

# Flask app configuration

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    while True:
        code = ''.join(random.choices(chars, k=length))
        if code not in db:
            return code

def generate_short_code_from_name(name):
    """Generate a URL-friendly short code from the name/description"""
    import re
    
    # Convert to lowercase and replace spaces with hyphens
    code = name.lower().replace(' ', '-')
    
    # Remove special characters, keep only letters, numbers, and hyphens
    code = re.sub(r'[^a-z0-9-]', '', code)
    
    # Remove multiple consecutive hyphens
    code = re.sub(r'-+', '-', code)
    
    # Remove leading/trailing hyphens
    code = code.strip('-')
    
    # Ensure minimum length of 3 characters
    if len(code) < 3:
        code = code + generate_short_code()[:3]
    
    # Limit to reasonable length (max 20 characters)
    if len(code) > 20:
        code = code[:20]
    
    # Check if code already exists, if so, append a number
    original_code = code
    counter = 1
    while code in db:
        code = f"{original_code}-{counter}"
        counter += 1
        # Prevent infinite loop
        if counter > 1000:
            code = generate_short_code()
            break
    
    return code

@app.route('/', methods=['GET'])
def index():
    # Track page view
    analytics_data['page_views'] += 1
    save_data()
    return render_template('index.html', short_url=None, qr_url=None)

@app.route('/manage')
def manage():
    # Track page view
    analytics_data['page_views'] += 1
    save_data()
    return render_template('manage.html')

@app.route('/shorten', methods=['GET', 'POST'])
def shorten():
    if request.method == 'GET':
        return render_template('index.html')
    
    # Handle POST request
    name = request.form.get('name', '').strip()
    url = request.form.get('url', '').strip()
    front_color = request.form.get('front_color', '#000000')
    back_color = request.form.get('back_color', '#FFFFFF')
    
    # Prepare form data to pass back in case of errors
    form_data = {
        'name': name,
        'url': url,
        'front_color': front_color,
        'back_color': back_color
    }
    
    if not url:
        return render_template('index.html', error="No URL provided", **form_data)
    if not name:
        return render_template('index.html', error="No name provided", **form_data)
    
    # Generate short code from name/description
    short_code = generate_short_code_from_name(name)
    
    # Store the URL mapping
    db[short_code] = url
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f"{request.host_url}s/{short_code}")
    qr.make(fit=True)
    
    # Create QR code image with custom colors
    img = qr.make_image(fill_color=front_color, back_color=back_color)
    
    # Store QR code metadata
    qr_storage[short_code] = {
        'name': name,
        'url': url,
        'created_at': datetime.now().isoformat(),
        'download_count': 0,
        'front_color': front_color,
        'back_color': back_color
    }
    
    # Track QR generation in analytics
    analytics_data['qr_generations'] = analytics_data.get('qr_generations', 0) + 1
    save_data()
    
    return render_template('index.html', 
                         short_url=f"{request.host_url}s/{short_code}",
                         qr_code_url=f"/qr/{short_code}",
                         name=name)

@app.route('/s/<code>')
def redirect_short(code):
    url = db.get(code)
    if url:
        return redirect(url)
    return "Invalid short link", 404

def generate_qr_image(code):
    """Helper function to generate QR code image"""
    try:
        if code not in db:
            print(f"QR Code generation: Code '{code}' not found in database")
            return None
            
        # Use the full external URL for the short link
        short_url = url_for('redirect_short', code=code, _external=True)
        print(f"QR Code generation: Generated URL - {short_url}")
        
        # Get stored colors or use defaults
        qr_data = qr_storage.get(code, {})
        front_color = qr_data.get('front_color', '#000000')
        back_color = qr_data.get('back_color', '#FFFFFF')
        
        # Create styled QR code with dot style, rounded eyes, and custom colors
        img = create_styled_qr(
            data=short_url,
            style='dot',
            inner_eye_style='rounded',
            outer_eye_style='rounded',
            front_color=front_color,
            back_color=back_color
        )
        print(f"QR Code generation: Successfully created QR code for '{code}'")
        return img
    except Exception as e:
        print(f"QR Code generation error for code '{code}': {str(e)}")
        import traceback
        traceback.print_exc()
        return None

@app.route('/qr/<code>')
def qr_code(code):
    try:
        img = generate_qr_image(code)
        if img is None:
            return "QR code not found", 404
        
        # Create BytesIO buffer
        buf = BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        
        # Return the file with proper headers
        return send_file(
            buf, 
            mimetype='image/png',
            as_attachment=False,
            download_name=f'qr_{code}.png'
        )
    except Exception as e:
        # Log error and return a simple error response
        print(f"QR Code generation error: {str(e)}")
        return "Error generating QR code", 500

@app.route('/download/<code>')
def download_qr(code):
    try:
        img = generate_qr_image(code)
        if img is None:
            return "QR code not found", 404
        
        # Update download count
        if code in qr_storage:
            qr_storage[code]['download_count'] += 1
        
        # Track download in analytics
        analytics_data['downloads'] += 1
        
        # Save data to persistent storage
        save_data()
        
        # Create BytesIO buffer
        buf = BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        
        # Get the name for filename, sanitize it for file system
        qr_data = qr_storage.get(code, {})
        name = qr_data.get('name', f'qr_{code}')
        # Sanitize filename by removing invalid characters
        import re
        safe_name = re.sub(r'[<>:"/\\|?*]', '_', name)
        safe_name = safe_name.strip().replace(' ', '_')
        
        # Return the file as download
        return send_file(
            buf, 
            mimetype='image/png',
            as_attachment=True,
            download_name=f'{safe_name}.png'
        )
    except Exception as e:
        print(f"QR Code download error: {str(e)}")
        return "Error downloading QR code", 500

@app.route('/api/stored-links')
def get_stored_links():
    """API endpoint to get all stored links"""
    links = []
    for code, url in db.items():
        metadata = qr_storage.get(code, {})
        links.append({
            'code': code,
            'name': metadata.get('name', 'Unnamed QR Code'),
            'url': url,
            'short_url': url_for('redirect_short', code=code, _external=True),
            'created': metadata.get('created', 'Unknown'),
            'downloads': metadata.get('downloads', 0)
        })
    return jsonify(links)

@app.route('/api/update-qr/<code>', methods=['POST'])
def update_qr(code):
    """API endpoint to update the name and URL for a given code"""
    try:
        if code not in db:
            return jsonify({'success': False, 'error': 'Code not found'})
        
        data = request.get_json()
        new_name = data.get('name')
        new_url = data.get('url')
        
        if not new_url:
            return jsonify({'success': False, 'error': 'No URL provided'})
        
        if not new_name:
            return jsonify({'success': False, 'error': 'No name provided'})
        
        # Update the URL
        db[code] = new_url
        
        # Update metadata
        if code in qr_storage:
            qr_storage[code]['name'] = new_name
            qr_storage[code]['url'] = new_url
            qr_storage[code]['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Save data to persistent storage
        save_data()
        
        return jsonify({'success': True, 'message': 'QR Code updated successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/delete-qr/<code>', methods=['DELETE'])
def delete_qr(code):
    """API endpoint to delete a QR code and its data"""
    try:
        if code not in db:
            return jsonify({'success': False, 'error': 'Code not found'})
        
        # Remove from both storage dictionaries
        del db[code]
        if code in qr_storage:
            del qr_storage[code]
        
        # Save data to persistent storage
        save_data()
        
        return jsonify({'success': True, 'message': 'QR Code deleted successfully'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """API endpoint to get analytics data"""
    try:
        # Calculate basic statistics
        total_qr_codes = len(qr_storage)
        total_downloads = sum(item.get('download_count', 0) for item in qr_storage.values())
        
        # Get popular URLs (top 5)
        url_counts = {}
        for item in qr_storage.values():
            url = item.get('url', '')
            url_counts[url] = url_counts.get(url, 0) + 1
        
        popular_urls = sorted(url_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Get creation dates for trend analysis
        creation_dates = {}
        for item in qr_storage.values():
            date = item.get('created_at', '').split(' ')[0]  # Get date part only
            if date:
                creation_dates[date] = creation_dates.get(date, 0) + 1
        
        analytics_data = {
            'total_qr_codes': total_qr_codes,
            'total_downloads': total_downloads,
            'popular_urls': popular_urls,
            'creation_trend': sorted(creation_dates.items()),
            'average_downloads': round(total_downloads / max(total_qr_codes, 1), 2)
        }
        
        return jsonify(analytics_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/system-stats', methods=['POST'])
def log_system_stats():
    """API endpoint to log system statistics"""
    try:
        stats = request.get_json()
        
        # Add timestamp to stats
        stats['timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Store in analytics data (keep only last 100 entries)
        analytics_data['system_stats'].append(stats)
        if len(analytics_data['system_stats']) > 100:
            analytics_data['system_stats'] = analytics_data['system_stats'][-100:]
        
        # Save data to persistent storage
        save_data()
        
        return jsonify({'success': True, 'message': 'Stats logged successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_backup():
    """Create a backup of current data"""
    if IS_PRODUCTION:
        # Skip backup operations in production (ephemeral storage)
        print("Skipping backup in production mode")
        return
        
    try:
        import shutil
        from datetime import datetime
        
        if not os.path.exists('data'):
            return
        
        backup_dir = f"data/backups/{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        os.makedirs(backup_dir, exist_ok=True)
        
        # Copy data files to backup directory
        for file in [DB_FILE, QR_STORAGE_FILE, ANALYTICS_FILE]:
            if os.path.exists(file):
                shutil.copy2(file, backup_dir)
        
        print(f"Backup created: {backup_dir}")
        
        # Keep only last 10 backups
        backup_parent = 'data/backups'
        if os.path.exists(backup_parent):
            backups = sorted([d for d in os.listdir(backup_parent) if os.path.isdir(os.path.join(backup_parent, d))])
            while len(backups) > 10:
                oldest = backups.pop(0)
                shutil.rmtree(os.path.join(backup_parent, oldest))
                
    except Exception as e:
        print(f"Backup creation failed: {e}")

if __name__ == '__main__':
    # Load existing data on startup
    print("Loading existing data...")
    load_data()
    print(f"Loaded {len(db)} URLs and {len(qr_storage)} QR codes")
    
    # Create backup before starting (skipped in production)
    create_backup()
    
    # Get port from environment variable (for Render compatibility)
    port = int(os.environ.get('PORT', 8000))
    
    # In development, run with Flask's built-in server
    # In production, this will be handled by gunicorn
    if not IS_PRODUCTION:
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        # This block won't execute on Render as gunicorn takes over
        app.run(host='0.0.0.0', port=port, debug=False)