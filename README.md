# QR Code Generator

A simple Flask web application that generates QR codes for URLs with shortened links.

## Features

- Generate shortened URLs for any link
- Create QR codes for the shortened URLs
- Clean and responsive web interface
- In-memory storage for quick access
- Ready for deployment on platforms like Render

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd QRCodeGen
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

The application will be available at `http://localhost:8000`

## Usage

1. Open the web application in your browser
2. Enter any URL in the input field
3. Click "Generate QR Code"
4. The app will display:
   - A shortened link
   - A QR code image that links to your original URL

## API Endpoints

- `GET /` - Main page with the form
- `POST /shorten` - Generate shortened URL and QR code
- `GET /s/<code>` - Redirect to original URL
- `GET /qr/<code>` - Get QR code image as PNG

## Deployment

### Deploying to Render

This application is configured for easy deployment on Render:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Render will automatically detect the configuration from `render.yaml`
4. Alternatively, you can use the following settings:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment Variables**: Set `PRODUCTION=true`

### Important Notes for Production

- The application uses in-memory storage in production mode (on Render)
- Data will not persist between application restarts on Render's free tier
- For persistent storage in production, consider implementing a database solution

This app is configured for deployment on Render using Gunicorn:

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. The app will automatically deploy using the `Procfile`

## Technologies Used

- **Flask** - Web framework
- **qrcode[pil]** - QR code generation with PIL support
- **Gunicorn** - WSGI server for production deployment

## License

MIT License