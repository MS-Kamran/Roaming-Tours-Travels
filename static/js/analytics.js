/**
 * Analytics tracking module for QR Code Generator
 * @fileoverview Handles user interaction tracking and analytics data collection
 */

/**
 * Tracks various events for analytics purposes
 * @param {string} eventType - The type of event to track
 * @param {Object} data - Additional data associated with the event
 */
function trackEvent(eventType, data = {}) {
    // Check if analytics is enabled
    if (!getConfig('analytics.enabled', true)) {
        return;
    }
    
    const analytics = JSON.parse(localStorage.getItem('qrAnalytics') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    if (!analytics[today]) {
        analytics[today] = {
            qr_generated: 0,
            qr_downloaded: 0,
            page_views: 0,
            qr_shared: 0,
            color_changed: 0,
            form_validation_error: 0,
            peak_hours: {},
            popular_urls: {},
            error_types: {}
        };
    }
    
    const hour = new Date().getHours();
    analytics[today].peak_hours[hour] = (analytics[today].peak_hours[hour] || 0) + 1;
    
    // Get event names from config
    const events = getConfig('analytics.events', {});
    
    switch(eventType) {
        case events.qrGenerated || 'qr_generated':
            analytics[today].qr_generated++;
            if (data.url) {
                analytics[today].popular_urls[data.url] = (analytics[today].popular_urls[data.url] || 0) + 1;
            }
            break;
        case events.qrDownloaded || 'qr_downloaded':
            analytics[today].qr_downloaded++;
            break;
        case events.pageView || 'page_view':
            analytics[today].page_views++;
            break;
        case events.qrShared || 'qr_shared':
            analytics[today].qr_shared++;
            break;
        case events.colorChanged || 'color_changed':
            analytics[today].color_changed++;
            break;
        case events.formValidationError || 'form_validation_error':
            analytics[today].form_validation_error++;
            if (data.field) {
                analytics[today].error_types[data.field] = (analytics[today].error_types[data.field] || 0) + 1;
            }
            break;
    }
    
    localStorage.setItem('qrAnalytics', JSON.stringify(analytics));
    
    // Log in debug mode
    if (getConfig('development.debug', false)) {
        console.log(`Analytics: ${eventType}`, data);
    }
}

/**
 * Gets analytics data for a specific date or all dates
 * @param {string} date - Optional date in YYYY-MM-DD format
 * @returns {Object} Analytics data
 */
function getAnalytics(date = null) {
    const analytics = JSON.parse(localStorage.getItem('qrAnalytics') || '{}');
    
    if (date) {
        return analytics[date] || null;
    }
    
    return analytics;
}

/**
 * Clears analytics data older than specified days
 * @param {number} days - Number of days to keep data for
 */
function cleanupAnalytics(days = null) {
    const retentionDays = days || getConfig('analytics.retentionDays', 30);
    const analytics = JSON.parse(localStorage.getItem('qrAnalytics') || '{}');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let deletedCount = 0;
    Object.keys(analytics).forEach(date => {
        if (new Date(date) < cutoffDate) {
            delete analytics[date];
            deletedCount++;
        }
    });
    
    localStorage.setItem('qrAnalytics', JSON.stringify(analytics));
    
    if (getConfig('development.debug', false)) {
        console.log(`Analytics cleanup: Removed ${deletedCount} old entries`);
    }
    
    return deletedCount;
}

/**
 * Gets summary statistics from analytics data
 * @returns {Object} Summary statistics
 */
function getAnalyticsSummary() {
    const analytics = getAnalytics();
    const summary = {
        totalQRGenerated: 0,
        totalDownloads: 0,
        totalPageViews: 0,
        mostActiveHour: null,
        mostPopularUrl: null,
        activeDays: Object.keys(analytics).length
    };
    
    const hourCounts = {};
    const urlCounts = {};
    
    Object.values(analytics).forEach(dayData => {
        summary.totalQRGenerated += dayData.qr_generated || 0;
        summary.totalDownloads += dayData.qr_downloaded || 0;
        summary.totalPageViews += dayData.page_views || 0;
        
        // Aggregate hour data
        Object.entries(dayData.peak_hours || {}).forEach(([hour, count]) => {
            hourCounts[hour] = (hourCounts[hour] || 0) + count;
        });
        
        // Aggregate URL data
        Object.entries(dayData.popular_urls || {}).forEach(([url, count]) => {
            urlCounts[url] = (urlCounts[url] || 0) + count;
        });
    });
    
    // Find most active hour
    let maxHourCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
        if (count > maxHourCount) {
            maxHourCount = count;
            summary.mostActiveHour = parseInt(hour);
        }
    });
    
    // Find most popular URL
    let maxUrlCount = 0;
    Object.entries(urlCounts).forEach(([url, count]) => {
        if (count > maxUrlCount) {
            maxUrlCount = count;
            summary.mostPopularUrl = url;
        }
    });
    
    return summary;
}

// Initialize analytics tracking on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if analytics is enabled
    if (!getConfig('analytics.enabled', true)) {
        return;
    }
    
    trackEvent(getConfig('analytics.events.pageView', 'page_view'));
    
    // Clean up old analytics data based on config frequency
    const lastCleanup = localStorage.getItem('lastAnalyticsCleanup');
    const now = Date.now();
    const cleanupFrequency = getConfig('analytics.cleanupFrequency', 7);
    const cleanupInterval = cleanupFrequency * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    if (!lastCleanup || (now - parseInt(lastCleanup)) > cleanupInterval) {
        const deletedCount = cleanupAnalytics();
        localStorage.setItem('lastAnalyticsCleanup', now.toString());
        
        if (getConfig('development.debug', false)) {
            console.log(`Analytics: Automatic cleanup completed, removed ${deletedCount} entries`);
        }
    }
});