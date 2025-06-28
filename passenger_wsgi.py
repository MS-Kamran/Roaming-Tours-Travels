#!/usr/bin/env python3
"""
WSGI application entry point for cPanel/Passenger deployment
This file is required for Namecheap shared hosting with cPanel
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables for production
os.environ['PRODUCTION'] = 'true'
os.environ['CPANEL_HOSTING'] = 'true'

# Import the Flask application
from app import app as application

# This is required for Passenger WSGI
if __name__ == "__main__":
    application.run()