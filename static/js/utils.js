/**
 * Utility functions for QR Code Generator
 * @fileoverview Contains helper functions for UI interactions and data manipulation
 */

/**
 * Updates the color preview for QR code customization
 * @param {string} type - The type of color ('front' or 'back')
 */
function updateColorPreview(type) {
    const colorInput = document.getElementById(type + '_color');
    const preview = document.getElementById(type + 'Preview');
    if (preview && colorInput) {
        preview.style.backgroundColor = colorInput.value;
        preview.style.transform = 'scale(1.1)';
        setTimeout(() => {
            preview.style.transform = 'scale(1)';
        }, getConfig('ui.animations.colorPreviewDuration', 200));
    }
}

/**
 * Shows a toast notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success' or 'error')
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : '⚠'}</span>
        <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, getConfig('ui.animations.toastDuration', 3000));
}

/**
 * Validates the QR code form inputs
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const url = document.getElementById('url').value.trim();
    
    // Get validation settings from config
    const nameMinLength = getConfig('validation.limits.nameMinLength', 1);
    const nameMaxLength = getConfig('validation.limits.nameMaxLength', 100);
    const urlMaxLength = getConfig('validation.limits.urlMaxLength', 2048);
    
    // Validate name
    if (!name) {
        showToast(getConfig('validation.messages.nameRequired', 'Please enter a name for your QR code'), 'error');
        return false;
    }
    
    if (name.length < nameMinLength) {
        showToast(getConfig('validation.messages.nameMinLength', `Name must be at least ${nameMinLength} character(s) long`), 'error');
        return false;
    }
    
    if (name.length > nameMaxLength) {
        showToast(getConfig('validation.messages.nameMaxLength', `Name cannot exceed ${nameMaxLength} characters`), 'error');
        return false;
    }
    
    // Validate URL
    if (!url) {
        showToast(getConfig('validation.messages.urlRequired', 'Please enter a valid URL'), 'error');
        return false;
    }
    
    if (url.length > urlMaxLength) {
        showToast(getConfig('validation.messages.urlMaxLength', `URL cannot exceed ${urlMaxLength} characters`), 'error');
        return false;
    }
    
    // URL format validation
    try {
        const testUrl = url.startsWith('http') ? url : 'https://' + url;
        new URL(testUrl);
        
        // Additional pattern validation if enabled
        const urlPattern = getConfig('validation.urlPatterns.basic');
        if (urlPattern && !urlPattern.test(url)) {
            throw new Error('Invalid URL format');
        }
    } catch {
        showToast(getConfig('validation.messages.urlInvalid', 'Please enter a valid URL format'), 'error');
        
        // Track validation errors if analytics enabled
        if (getConfig('analytics.enabled', true)) {
            trackEvent(getConfig('analytics.events.formValidationError', 'form_validation_error'), {
                field: 'url',
                value: url.substring(0, 50) // Only log first 50 chars for privacy
            });
        }
        
        return false;
    }
    
    return true;
}

/**
 * Copies text to clipboard with fallback for older browsers
 * @param {string} text - The text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!');
    }, function(err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy', 'error');
        }
        document.body.removeChild(textArea);
    });
}

/**
 * Downloads QR code image
 * @param {string} url - The URL of the QR code image
 * @param {string} filename - The filename for download
 */
function downloadQR(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR Code downloaded!');
}

/**
 * Gets basic system information for monitoring
 * @returns {Object} System information object
 */
function getSystemInfo() {
    const info = {
        timestamp: new Date().toISOString(),
        memory: {
            used: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB' : 'N/A',
            total: performance.memory ? Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB' : 'N/A'
        },
        connection: navigator.connection ? {
            type: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink + ' Mbps'
        } : 'N/A',
        userAgent: navigator.userAgent.substring(0, 100)
    };
    
    console.log('System Info:', info);
    return info;
}