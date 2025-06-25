/**
 * Configuration file for QR Code Generator
 * @fileoverview Contains all customizable settings and constants
 */

/**
 * Application configuration object
 * Modify these values to customize the application behavior
 */
window.QRConfig = {
    // UI Settings
    ui: {
        // Animation timings (in milliseconds)
        animations: {
            resultShowDelay: 300,
            colorPreviewDuration: 200,
            toastDuration: 3000,
            fadeTransition: 300
        },
        
        // Color settings
        colors: {
            defaultFrontColor: '#000000',
            defaultBackColor: '#FFFFFF',
            primaryColor: '#667eea',
            successColor: '#10b981',
            errorColor: '#ef4444',
            warningColor: '#f59e0b'
        },
        
        // Toast notification settings
        toast: {
            position: 'top-right', // top-left, top-right, bottom-left, bottom-right
            maxVisible: 3,
            autoClose: true,
            closeButton: true
        }
    },
    
    // Form validation settings
    validation: {
        // URL validation patterns
        urlPatterns: {
            // Basic URL pattern
            basic: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/.*)?$/,
            // Strict URL pattern
            strict: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
        },
        
        // Input length limits
        limits: {
            nameMinLength: 1,
            nameMaxLength: 100,
            urlMaxLength: 2048,
            descriptionMaxLength: 500
        },
        
        // Validation messages
        messages: {
            nameRequired: 'Please enter a name for your QR code',
            nameMinLength: 'Name must be at least 1 character long',
            nameMaxLength: 'Name cannot exceed 100 characters',
            urlRequired: 'Please enter a valid URL',
            urlInvalid: 'Please enter a valid URL format',
            urlMaxLength: 'URL cannot exceed 2048 characters'
        }
    },
    
    // QR Code generation settings
    qrCode: {
        // Default size settings
        sizes: {
            small: 150,
            medium: 200,
            large: 300,
            xlarge: 400
        },
        
        // Quality settings
        quality: {
            low: 0.7,
            medium: 0.8,
            high: 0.9,
            ultra: 1.0
        },
        
        // Error correction levels
        errorCorrection: {
            L: 'Low (~7%)',
            M: 'Medium (~15%)',
            Q: 'Quartile (~25%)',
            H: 'High (~30%)'
        }
    },
    
    // Analytics settings
    analytics: {
        // Enable/disable analytics tracking
        enabled: true,
        
        // Data retention period (in days)
        retentionDays: 30,
        
        // Cleanup frequency (in days)
        cleanupFrequency: 7,
        
        // Events to track
        events: {
            pageView: 'page_view',
            qrGenerated: 'qr_generated',
            qrDownloaded: 'qr_downloaded',
            qrShared: 'qr_shared',
            colorChanged: 'color_changed',
            formValidationError: 'form_validation_error'
        }
    },
    
    // Performance settings
    performance: {
        // Enable performance monitoring
        monitoring: true,
        
        // Debounce delays (in milliseconds)
        debounce: {
            colorPreview: 100,
            formValidation: 300,
            search: 500
        },
        
        // Cache settings
        cache: {
            enabled: true,
            maxAge: 3600000, // 1 hour in milliseconds
            maxSize: 50 // Maximum number of cached items
        }
    },
    
    // Security settings
    security: {
        // Rate limiting (requests per minute)
        rateLimit: {
            qrGeneration: 10,
            formSubmission: 5
        },
        
        // Input sanitization
        sanitization: {
            enabled: true,
            allowedTags: [], // No HTML tags allowed in inputs
            maxInputLength: 10000
        }
    },
    
    // Feature flags
    features: {
        // Enable/disable specific features
        colorCustomization: true,
        downloadQR: true,
        shareQR: true,
        qrHistory: true,
        analytics: true,
        keyboardShortcuts: true,
        darkMode: false, // Future feature
        bulkGeneration: false, // Future feature
        apiAccess: false // Future feature
    },
    
    // API endpoints (if using external services)
    api: {
        baseUrl: '',
        endpoints: {
            generate: '/api/generate',
            download: '/api/download',
            analytics: '/api/analytics'
        },
        timeout: 30000 // 30 seconds
    },
    
    // Localization settings
    localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'es', 'fr', 'de', 'zh'],
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h' // 12h or 24h
    },
    
    // Development settings
    development: {
        debug: false,
        verbose: false,
        mockData: false,
        skipValidation: false
    }
};

/**
 * Get configuration value by path
 * @param {string} path - Dot notation path to config value
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
window.getConfig = function(path, defaultValue = null) {
    const keys = path.split('.');
    let value = window.QRConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
};

/**
 * Set configuration value by path
 * @param {string} path - Dot notation path to config value
 * @param {*} value - Value to set
 */
window.setConfig = function(path, value) {
    const keys = path.split('.');
    let config = window.QRConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in config) || typeof config[key] !== 'object') {
            config[key] = {};
        }
        config = config[key];
    }
    
    config[keys[keys.length - 1]] = value;
};

/**
 * Merge user configuration with default configuration
 * @param {Object} userConfig - User configuration object
 */
window.mergeConfig = function(userConfig) {
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    deepMerge(window.QRConfig, userConfig);
};

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.QRConfig;
}