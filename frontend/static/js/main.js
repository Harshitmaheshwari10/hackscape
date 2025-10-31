/**
 * Main Application with Enhanced Global Functions
 */

// Global utility functions
function refreshData() {
    console.log('Refreshing current section...');
    dashboard.loadSectionData(dashboard.currentSection);
    showNotification('Data refreshed', 'success');
}

function refreshInventory() {
    dashboard.loadInventoryData();
    showNotification('Inventory refreshed', 'success');
}

function generateForecast() {
    dashboard.loadForecastingData();
    showNotification('Forecast generated', 'success');
}

function markAllRead() {
    showNotification('All alerts marked as read', 'success');
    dashboard.updateAlertCounts(0);
}

function refreshOptimization() {
    dashboard.loadOptimizationData();
    showNotification('Optimization data refreshed', 'success');
}

function refreshSuppliers() {
    dashboard.loadSuppliersData();
    showNotification('Supplier data refreshed', 'success');
}

function refreshWeather() {
    dashboard.loadWeatherData();
    showNotification('Weather data refreshed', 'success');
}

/**
 * Export report functionality
 */
async function exportReport() {
    try {
        dashboard.showLoading();
        
        const reportType = dashboard.currentSection === 'overview' ? 'overview' : 
                          dashboard.currentSection === 'inventory' ? 'inventory' :
                          dashboard.currentSection === 'alerts' ? 'alerts' : 'overview';
        
        const result = await apiClient.exportReport(reportType);
        
        if (result.success) {
            // Create and download CSV file
            const csvData = result.data.csv_data;
            const filename = result.data.filename;
            
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showNotification(`Report exported: ${filename}`, 'success');
        } else {
            showNotification('Export failed', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed', 'error');
    } finally {
        dashboard.hideLoading();
    }
}

function exportOptimization() {
    exportReport();
}

/**
 * View product details
 */
async function viewProductDetails(productId) {
    try {
        const result = await apiClient.getProductTracking(productId);
        
        if (result.success) {
            showProductModal(result.data);
        }
    } catch (error) {
        console.error('Error viewing product:', error);
        showNotification('Failed to load product details', 'error');
    }
}

/**
 * Show transfer stock dialog
 */
function showTransferDialog(productId) {
    const modal = createModal('Transfer Stock', `
        <form id="transfer-form">
            <input type="hidden" name="product_id" value="${productId}">
            <div class="form-group">
                <label>From Location:</label>
                <select name="from_location" required>
                    <option value="WH-001">Warehouse North</option>
                    <option value="WH-002">Warehouse South</option>
                    <option value="DC-001">Distribution Center East</option>
                    <option value="DC-002">Distribution Center West</option>
                </select>
            </div>
            <div class="form-group">
                <label>To Location:</label>
                <select name="to_location" required>
                    <option value="WH-001">Warehouse North</option>
                    <option value="WH-002">Warehouse South</option>
                    <option value="DC-001">Distribution Center East</option>
                    <option value="DC-002">Distribution Center West</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity:</label>
                <input type="number" name="quantity" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary">Transfer Stock</button>
        </form>
    `);
    
    document.getElementById('transfer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleTransferStock(new FormData(e.target));
        closeModal();
    });
}

/**
 * Show adjust stock dialog
 */
function showAdjustDialog(productId) {
    const modal = createModal('Adjust Stock', `
        <form id="adjust-form">
            <input type="hidden" name="product_id" value="${productId}">
            <div class="form-group">
                <label>Adjustment Type:</label>
                <select name="adjustment_type" id="adjustment_type" required>
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                </select>
            </div>
            <div class="form-group">
                <label>Quantity:</label>
                <input type="number" name="quantity" min="1" required>
            </div>
            <div class="form-group">
                <label>Reason:</label>
                <textarea name="reason" rows="3" placeholder="Enter reason for adjustment"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Adjust Stock</button>
        </form>
    `);
    
    document.getElementById('adjust-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAdjustStock(new FormData(e.target));
        closeModal();
    });
}

/**
 * Handle transfer stock
 */
async function handleTransferStock(formData) {
    try {
        dashboard.showLoading();
        
        const transferData = {
            product_id: formData.get('product_id'),
            from_location: formData.get('from_location'),
            to_location: formData.get('to_location'),
            quantity: parseInt(formData.get('quantity'))
        };
        
        const result = await apiClient.transferStock(transferData);
        
        if (result.success) {
            showNotification('Stock transferred successfully', 'success');
            dashboard.loadInventoryData();
        } else {
            showNotification(result.data.error || 'Transfer failed', 'error');
        }
    } catch (error) {
        console.error('Transfer error:', error);
        showNotification('Transfer failed', 'error');
    } finally {
        dashboard.hideLoading();
    }
}

/**
 * Handle adjust stock
 */
async function handleAdjustStock(formData) {
    try {
        dashboard.showLoading();
        
        const adjustmentType = formData.get('adjustment_type');
        const quantity = parseInt(formData.get('quantity'));
        
        const adjustmentData = {
            product_id: formData.get('product_id'),
            adjustment: adjustmentType === 'add' ? quantity : -quantity,
            reason: formData.get('reason') || 'Manual adjustment'
        };
        
        const result = await apiClient.adjustStock(adjustmentData);
        
        if (result.success) {
            showNotification('Stock adjusted successfully', 'success');
            dashboard.loadInventoryData();
        } else {
            showNotification(result.data.error || 'Adjustment failed', 'error');
        }
    } catch (error) {
        console.error('Adjustment error:', error);
        showNotification('Adjustment failed', 'error');
    } finally {
        dashboard.hideLoading();
    }
}

/**
 * Create purchase order
 */
function createPurchaseOrder(productId, quantity) {
    if (confirm(`Create purchase order for ${quantity} units?`)) {
        showNotification(`Purchase order created for ${quantity} units`, 'success');
        // In production, this would call an API to create the order
    }
}

/**
 * Show product modal
 */
function showProductModal(productData) {
    const modal = createModal(productData.product.name, `
        <div class="product-details">
            <div class="detail-row">
                <span><strong>SKU:</strong></span>
                <span>${productData.product.sku}</span>
            </div>
            <div class="detail-row">
                <span><strong>Category:</strong></span>
                <span>${productData.product.category}</span>
            </div>
            <div class="detail-row">
                <span><strong>Current Stock:</strong></span>
                <span>${productData.product.current_stock}</span>
            </div>
            <div class="detail-row">
                <span><strong>Reorder Point:</strong></span>
                <span>${productData.product.reorder_point}</span>
            </div>
            <div class="detail-row">
                <span><strong>Supplier:</strong></span>
                <span>${productData.product.supplier}</span>
            </div>
        </div>
        <h4>Movement History</h4>
        <div class="movement-history">
            ${productData.movement_history.slice(0, 10).map(m => `
                <div class="movement-item">
                    <i class="fas fa-${dashboard.getMovementIcon(m.movement_type)}"></i>
                    <div>
                        <p><strong>${dashboard.getMovementTitle(m.movement_type)}</strong></p>
                        <p class="small">${m.reason || ''} - ${dashboard.formatTime(m.timestamp)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `);
}

/**
 * Create modal dialog
 */
function createModal(title, content) {
    // Remove existing modal
    closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    return modal;
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.querySelector('.custom-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Get notification icon
 */
function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-times-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 AI Demand Forecasting Dashboard - Initializing...');
    
    try {
        // Add notification styles
        addNotificationStyles();
        
        // Add modal styles
        addModalStyles();
        
        // Initialize dashboard
        await dashboard.init();
        
        console.log('✅ Dashboard initialized successfully!');
        showNotification('Welcome! Dashboard is ready.', 'success');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showNotification('Failed to initialize dashboard', 'error');
    }
});

/**
 * Add notification styles
 */
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            min-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification i {
            font-size: 1.25rem;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-success i {
            color: #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-error i {
            color: #ef4444;
        }
        
        .notification-warning {
            border-left: 4px solid #f59e0b;
        }
        
        .notification-warning i {
            color: #f59e0b;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification-info i {
            color: #3b82f6;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .pulse {
            animation: pulse 1s infinite;
        }
    `;
    document.head.appendChild(styles);
}

/**
 * Add modal styles
 */
function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .custom-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .custom-modal.active {
            opacity: 1;
        }

        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }

        .modal-content {
            position: relative;
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 1.5rem;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .modal-close:hover {
            background: #f3f4f6;
        }

        .modal-body {
            padding: 20px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 14px;
        }

        .product-details .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .movement-history {
            max-height: 300px;
            overflow-y: auto;
        }

        .movement-item {
            display: flex;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .movement-item i {
            font-size: 1.5rem;
            color: #4f46e5;
        }

        .movement-item p {
            margin: 0;
        }

        .movement-item .small {
            font-size: 0.875rem;
            color: #6b7280;
        }
    `;
    document.head.appendChild(styles);
}

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        dashboard.stopAutoRefresh();
    } else {
        dashboard.startAutoRefresh();
        refreshData();
    }
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        chartManager.destroyAll();
        dashboard.loadSectionData(dashboard.currentSection);
    }, 250);
});

console.log('📊 Main.js loaded - All systems ready!');
