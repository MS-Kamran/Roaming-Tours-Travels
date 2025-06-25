/**
 * Main application logic for QR Code Generator
 * @fileoverview Core functionality for form handling, UI interactions, and application initialization
 */

/**
 * Application selectors - these remain constant
 */
const AppSelectors = {
    form: '#qrForm',
    submitBtn: '#submitBtn',
    loading: '#loading',
    result: '.result',
    nameInput: '#name',
    urlInput: '#url',
    frontColorInput: '#front_color',
    backColorInput: '#back_color'
};

/**
 * Main application class
 */
class QRCodeApp {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.loading = null;
        this.isSubmitting = false;
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.bindElements();
        this.setupEventListeners();
        this.initializeUI();
    }
    
    /**
     * Bind DOM elements to class properties
     */
    bindElements() {
        this.form = document.querySelector(AppSelectors.form);
        this.submitBtn = document.querySelector(AppSelectors.submitBtn);
        this.loading = document.querySelector(AppSelectors.loading);
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Input focus/blur animations
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', this.handleInputFocus.bind(this));
            input.addEventListener('blur', this.handleInputBlur.bind(this));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Color input changes
        const frontColorInput = document.querySelector(AppSelectors.frontColorInput);
        const backColorInput = document.querySelector(AppSelectors.backColorInput);
        
        if (frontColorInput) {
            frontColorInput.addEventListener('change', () => updateColorPreview('front'));
        }
        
        if (backColorInput) {
            backColorInput.addEventListener('change', () => updateColorPreview('back'));
        }
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        // Initialize color previews
        updateColorPreview('front');
        updateColorPreview('back');
        
        // Show result section if it exists
        const result = document.querySelector(AppSelectors.result);
        if (result) {
            setTimeout(() => {
                result.classList.add('show');
            }, getConfig('ui.animations.resultShowDelay', 300));
        }
    }
    
    /**
     * Handle form submission
     * @param {Event} e - The form submit event
     */
    handleFormSubmit(e) {
        if (!validateForm()) {
            e.preventDefault();
            return;
        }
        
        if (this.isSubmitting) {
            e.preventDefault();
            return;
        }
        
        this.showLoadingState();
        this.hideExistingResults();
        
        // Track analytics
        const urlValue = document.querySelector(AppSelectors.urlInput).value;
        const nameValue = document.querySelector(AppSelectors.nameInput).value;
        
        if (getConfig('analytics.enabled', true)) {
            trackEvent(getConfig('analytics.events.qrGenerated', 'qr_generated'), {
                url: urlValue,
                name: nameValue
            });
        }
    }
    
    /**
     * Show loading state during form submission
     */
    showLoadingState() {
        this.isSubmitting = true;
        
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block;"></span>Generating...';
        }
        
        if (this.loading) {
            this.loading.classList.add('show');
        }
    }
    
    /**
     * Hide existing results before showing new ones
     */
    hideExistingResults() {
        const result = document.querySelector(AppSelectors.result);
        if (result) {
            result.classList.remove('show');
        }
    }
    
    /**
     * Handle input focus events
     * @param {Event} e - The focus event
     */
    handleInputFocus(e) {
        const formGroup = e.target.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('focused');
        }
    }
    
    /**
     * Handle input blur events
     * @param {Event} e - The blur event
     */
    handleInputBlur(e) {
        const formGroup = e.target.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('focused');
        }
    }
    
    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.form && !this.isSubmitting) {
                    this.form.dispatchEvent(new Event('submit'));
                }
            }
        }
    }
    
    /**
     * Reset the form to its initial state
     */
    resetForm() {
        this.isSubmitting = false;
        
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = 'Generate QR Code';
        }
        
        if (this.loading) {
            this.loading.classList.remove('show');
        }
    }
    
    /**
     * Get current form data
     * @returns {Object} Form data object
     */
    getFormData() {
        const nameInput = document.querySelector(AppSelectors.nameInput);
        const urlInput = document.querySelector(AppSelectors.urlInput);
        const frontColorInput = document.querySelector(AppSelectors.frontColorInput);
        const backColorInput = document.querySelector(AppSelectors.backColorInput);
        
        return {
            name: nameInput ? nameInput.value.trim() : '',
            url: urlInput ? urlInput.value.trim() : '',
            frontColor: frontColorInput ? frontColorInput.value : getConfig('ui.colors.defaultFrontColor', '#000000'),
            backColor: backColorInput ? backColorInput.value : getConfig('ui.colors.defaultBackColor', '#FFFFFF')
        };
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        setConfig('development.debug', enabled);
        if (enabled) {
            console.log('QR Code App: Debug mode enabled');
            console.log('Current configuration:', window.QRConfig);
        }
    }
    
    /**
     * Get current application state
     * @returns {Object} Current state object
     */
    getState() {
        return {
            isSubmitting: this.isSubmitting,
            formData: this.getFormData(),
            config: window.QRConfig
        };
    }
    
    /**
     * Update application configuration
     * @param {Object} newConfig - New configuration to merge
     */
    updateConfig(newConfig) {
        mergeConfig(newConfig);
        
        if (getConfig('development.debug', false)) {
             console.log('Configuration updated:', newConfig);
         }
     }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main application
    window.qrApp = new QRCodeApp();
    
    // Enable debug mode if specified in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        window.qrApp.setDebugMode(true);
    }
    
    // Log initialization if debug mode is enabled
    if (getConfig('development.debug', false)) {
        console.log('QR Code Generator initialized successfully');
        console.log('Application state:', window.qrApp.getState());
    }
});