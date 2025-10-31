/**
 * Enhanced API Communication with WebSocket Support
 */

const API_BASE_URL = 'http://localhost:5000/api';
const WS_URL = 'http://localhost:5000';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
        this.socket = null;
        this.initializeWebSocket();
    }

    /**
     * Initialize WebSocket connection for real-time updates
     */
    initializeWebSocket() {
        try {
            // Load Socket.IO from CDN (ensure it's in HTML)
            if (typeof io !== 'undefined') {
                this.socket = io(WS_URL);
                
                this.socket.on('connect', () => {
                    console.log('✅ WebSocket connected');
                });
                
                this.socket.on('disconnect', () => {
                    console.log('❌ WebSocket disconnected');
                });
                
                // Listen for real-time updates
                this.socket.on('product_added', (data) => {
                    console.log('New product added:', data);
                    this.triggerUpdate('product_added', data);
                });
                
                this.socket.on('product_removed', (data) => {
                    console.log('Product removed:', data);
                    this.triggerUpdate('product_removed', data);
                });
                
                this.socket.on('stock_transferred', (data) => {
                    console.log('Stock transferred:', data);
                    this.triggerUpdate('stock_transferred', data);
                });
                
                this.socket.on('stock_adjusted', (data) => {
                    console.log('Stock adjusted:', data);
                    this.triggerUpdate('stock_adjusted', data);
                });
                
                this.socket.on('new_alert', (data) => {
                    console.log('New alert:', data);
                    this.triggerUpdate('new_alert', data);
                });
            } else {
                console.warn('Socket.IO not loaded. Real-time updates disabled.');
            }
        } catch (error) {
            console.error('WebSocket initialization failed:', error);
        }
    }

    /**
     * Trigger custom events for UI updates
     */
    triggerUpdate(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API request failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Dashboard Overview
     */
    async getDashboardOverview() {
        return await this.request('/dashboard/overview');
    }

    /**
     * Get all products
     */
    async getProducts() {
        return await this.request('/inventory/products');
    }

    /**
     * Add new product
     */
    async addProduct(productData) {
        return await this.request('/inventory/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Delete product
     */
    async deleteProduct(productId) {
        return await this.request(`/inventory/products/${productId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Transfer stock between locations
     */
    async transferStock(transferData) {
        return await this.request('/inventory/transfer', {
            method: 'POST',
            body: JSON.stringify(transferData)
        });
    }

    /**
     * Adjust stock levels
     */
    async adjustStock(adjustmentData) {
        return await this.request('/inventory/adjust', {
            method: 'POST',
            body: JSON.stringify(adjustmentData)
        });
    }

    /**
     * Get product tracking history
     */
    async getProductTracking(productId) {
        return await this.request(`/inventory/tracking/${productId}`);
    }

    /**
     * Inventory Tracking
     */
    async getInventoryTracking(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/inventory/tracking?${params}` : '/inventory/tracking';
        return await this.request(endpoint);
    }

    /**
     * Get demand forecast for specific product
     */
    async getDemandPrediction(productId = 'PROD-001', periods = 12) {
        return await this.request(`/demand/forecast/${productId}?periods=${periods}`);
    }

    /**
     * Alerts
     */
    async getAlerts(severity = null, limit = 50) {
        const params = new URLSearchParams();
        if (severity) params.append('severity', severity);
        params.append('limit', limit);
        return await this.request(`/alerts?${params.toString()}`);
    }

    /**
     * Optimization Recommendations
     */
    async getReplenishmentOptimization() {
        return await this.request('/optimization/replenishment');
    }

    /**
     * Resource Allocation
     */
    async getResourceAllocation() {
        return await this.request('/optimization/resource-allocation');
    }

    /**
     * Supplier Performance
     */
    async getSupplierPerformance() {
        return await this.request('/suppliers/performance');
    }

    /**
     * Weather Impact for specific product
     */
    async getWeatherImpact(productId = null) {
        if (productId) {
            return await this.request(`/weather/impact/${productId}`);
        }
        return await this.request('/external/weather');
    }

    /**
     * Export report as CSV
     */
    async exportReport(reportType = 'overview') {
        return await this.request(`/export/report?type=${reportType}`);
    }

    /**
     * Request real-time alert update via WebSocket
     */
    requestAlertUpdate() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('request_alert_update');
        }
    }
}

// Create global API client instance
const apiClient = new APIClient();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, apiClient };
}
