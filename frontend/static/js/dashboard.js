/**
 * Enhanced Dashboard with Real-time Updates and All Features
 */

class Dashboard {
    constructor() {
        this.currentSection = 'overview';
        this.refreshInterval = null;
        this.selectedProductId = null;
        this.charts = {};
    }

    /**
     * Initialize dashboard
     */
    async init() {
        console.log('🚀 Dashboard initializing...');
        
        this.setupNavigation();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        
        await this.loadOverviewData();
        this.startAutoRefresh();
        
        console.log('✅ Dashboard ready!');
    }

    /**
     * Setup real-time event listeners
     */
    setupRealTimeUpdates() {
        // Listen for product changes
        window.addEventListener('product_added', (e) => {
            console.log('Product added event received');
            this.handleProductAdded(e.detail);
        });

        window.addEventListener('product_removed', (e) => {
            console.log('Product removed event received');
            this.handleProductRemoved(e.detail);
        });

        window.addEventListener('stock_transferred', (e) => {
            console.log('Stock transferred event received');
            this.handleStockChange(e.detail);
        });

        window.addEventListener('stock_adjusted', (e) => {
            console.log('Stock adjusted event received');
            this.handleStockChange(e.detail);
        });

        window.addEventListener('new_alert', (e) => {
            console.log('New alert event received');
            this.handleNewAlert(e.detail);
        });
    }

    /**
     * Handle real-time product addition
     */
    handleProductAdded(data) {
        // Update KPIs
        this.loadOverviewData();
        
        // Show notification
        showNotification(`New product added: ${data.name}`, 'success');
        
        // If on inventory page, refresh table
        if (this.currentSection === 'inventory') {
            this.loadInventoryData();
        }
    }

    /**
     * Handle real-time product removal
     */
    handleProductRemoved(data) {
        this.loadOverviewData();
        showNotification('Product removed from inventory', 'info');
        
        if (this.currentSection === 'inventory') {
            this.loadInventoryData();
        }
    }

    /**
     * Handle real-time stock changes
     */
    handleStockChange(data) {
        this.loadOverviewData();
        
        if (this.currentSection === 'inventory') {
            this.loadInventoryData();
        }
    }

    /**
     * Handle new alerts
     */
    handleNewAlert(data) {
        // Update alert badge
        this.updateAlertCounts(data.count);
        
        // Show notification for critical alerts
        const criticalAlerts = data.alerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
            criticalAlerts.forEach(alert => {
                showNotification(`🚨 CRITICAL: ${alert.message}`, 'error');
            });
        }
        
        // Refresh alerts page if open
        if (this.currentSection === 'alerts') {
            this.loadAlertsData();
        }
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });
    }

    /**
     * Setup event listeners for filters and actions
     */
    setupEventListeners() {
        // Product selector for overview demand graph
        const overviewProductSelector = document.getElementById('overview-product-selector');
        if (overviewProductSelector) {
            overviewProductSelector.addEventListener('change', (e) => {
                this.selectedProductId = e.target.value;
                this.loadProductSpecificDemand(this.selectedProductId);
            });
        }

        // Forecasting filters
        const productFilterForecast = document.getElementById('product-filter-forecast');
        if (productFilterForecast) {
            productFilterForecast.addEventListener('change', () => {
                this.loadForecastingData();
            });
        }

        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', () => {
                this.loadForecastingData();
            });
        }

        // Alert filter
        const severityFilter = document.getElementById('severity-filter');
        if (severityFilter) {
            severityFilter.addEventListener('change', () => {
                this.loadAlertsData();
            });
        }

        // Inventory product selector for graphs
        const inventoryProductSelector = document.getElementById('inventory-product-selector');
        if (inventoryProductSelector) {
            inventoryProductSelector.addEventListener('change', (e) => {
                this.selectedProductId = e.target.value;
                this.loadInventoryGraphsForProduct(this.selectedProductId);
            });
        }

        // Weather product selector
        const weatherProductSelector = document.getElementById('weather-product-selector');
        if (weatherProductSelector) {
            weatherProductSelector.addEventListener('change', (e) => {
                this.loadWeatherDataForProduct(e.target.value);
            });
        }
    }

    /**
     * Switch between sections
     */
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(`${sectionName}-section`);
        if (activeSection) activeSection.classList.add('active');

        // Update breadcrumb
        const breadcrumb = document.getElementById('current-section');
        if (breadcrumb) {
            breadcrumb.textContent = this.getSectionTitle(sectionName);
        }

        // Load section data
        this.currentSection = sectionName;
        this.loadSectionData(sectionName);
    }

    /**
     * Get section title
     */
    getSectionTitle(section) {
        const titles = {
            'overview': 'Overview',
            'inventory': 'Inventory Tracking',
            'forecasting': 'Demand Forecasting',
            'alerts': 'Alerts',
            'optimization': 'Process Optimization',
            'suppliers': 'Suppliers',
            'weather': 'Weather Impact'
        };
        return titles[section] || section;
    }

    /**
     * Load section-specific data
     */
    async loadSectionData(section) {
        switch(section) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'inventory':
                await this.loadInventoryData();
                break;
            case 'forecasting':
                await this.loadForecastingData();
                break;
            case 'alerts':
                await this.loadAlertsData();
                break;
            case 'optimization':
                await this.loadOptimizationData();
                break;
            case 'suppliers':
                await this.loadSuppliersData();
                break;
            case 'weather':
                await this.loadWeatherData();
                break;
        }
    }

    /**
     * Load Overview Data with dynamic updates
     */
    async loadOverviewData() {
        this.showLoading();
        
        try {
            const result = await apiClient.getDashboardOverview();
            
            if (result.success) {
                const data = result.data;
                
                // Update KPIs with animation
                this.updateKPIsAnimated(data.kpis);
                
                // Update alert counts
                this.updateAlertCounts(data.kpis.critical_alerts);
                
                // Populate product selector if not already done
                await this.populateProductSelector('overview-product-selector');
                
                // Render inventory distribution chart
                this.renderInventoryDistributionChart(data.inventory_summary);
                
                // Render alerts preview
                this.renderAlertsPreview(data.recent_alerts);
                
                // Load product-specific demand graph
                const selectedProduct = document.getElementById('overview-product-selector')?.value || 'PROD-001';
                await this.loadProductSpecificDemand(selectedProduct);
            }
        } catch (error) {
            console.error('Error loading overview:', error);
            showNotification('Failed to load overview data', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Update KPIs with smooth animation
     */
    updateKPIsAnimated(kpis) {
        this.animateNumber('kpi-total-products', kpis.total_products);
        this.animateNumber('kpi-inventory-value', kpis.total_inventory_value, true);
        this.animateNumber('kpi-critical-alerts', kpis.critical_alerts);
        this.animateNumber('kpi-forecast-accuracy', kpis.forecast_accuracy, false, '%');
    }

    /**
     * Animate number changes
     */
    animateNumber(elementId, targetValue, isCurrency = false, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseFloat(element.textContent.replace(/[^0-9.]/g, '')) || 0;
        const duration = 1000; // 1 second
        const steps = 30;
        const increment = (targetValue - currentValue) / steps;
        let current = currentValue;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            current += increment;
            
            if (step >= steps) {
                current = targetValue;
                clearInterval(timer);
            }
            
            let displayValue = Math.round(current);
            if (isCurrency) {
                element.textContent = `$${displayValue.toLocaleString()}`;
            } else {
                element.textContent = displayValue + suffix;
            }
        }, duration / steps);
    }

    /**
     * Populate product selector dropdown
     */
    async populateProductSelector(selectorId) {
        const selector = document.getElementById(selectorId);
        if (!selector || selector.options.length > 1) return;
        
        const result = await apiClient.getProducts();
        
        if (result.success && result.data.products) {
            result.data.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                selector.appendChild(option);
            });
        }
    }

    /**
     * Load product-specific demand graph for overview
     */
    async loadProductSpecificDemand(productId) {
        const result = await apiClient.getDemandPrediction(productId, 6);
        
        if (result.success) {
            const data = result.data;
            chartManager.createDemandTrendChart(
                data.historical,
                data.forecast,
                'demand-trend-chart'
            );
        }
    }

    /**
     * Render inventory distribution chart with dynamic locations
     */
    renderInventoryDistributionChart(inventorySummary) {
        const chartData = {
            labels: inventorySummary.map(loc => loc.location),
            values: inventorySummary.map(loc => loc.current_stock)
        };
        
        chartManager.createInventoryDistributionChart(chartData);
    }

    /**
     * Render alerts preview
     */
    renderAlertsPreview(alerts) {
        const container = document.getElementById('alerts-preview');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = '<p class="loading">No alerts at this time</p>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-icon ${alert.severity}">
                    <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <p class="alert-title">${alert.product}</p>
                    <p class="alert-message">${alert.message}</p>
                    <span class="alert-time">${this.formatTime(alert.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load Inventory Data with enhanced features
     */
    async loadInventoryData() {
        this.showLoading();
        
        try {
            const result = await apiClient.getInventoryTracking();
            
            if (result.success) {
                const data = result.data;
                
                // Update summary counts (NO critical stock section - as requested)
                document.getElementById('optimal-count').textContent = data.summary.optimal_items || 0;
                document.getElementById('low-stock-count').textContent = data.summary.low_stock_items || 0;
                document.getElementById('overstock-count').textContent = data.summary.overstock_items || 0;
                
                // Populate product selector for graphs
                await this.populateProductSelector('inventory-product-selector');
                
                // Render inventory table with actions
                this.renderInventoryTableEnhanced(data.products);
                
                // Load graphs for first product
                if (data.products.length > 0) {
                    const firstProductId = document.getElementById('inventory-product-selector')?.value || data.products[0].id;
                    await this.loadInventoryGraphsForProduct(firstProductId);
                }
            }
        } catch (error) {
            console.error('Error loading inventory:', error);
            showNotification('Failed to load inventory data', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Render enhanced inventory table with transfer/adjust actions
     */
    renderInventoryTableEnhanced(products) {
        const tbody = document.getElementById('inventory-table-body');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => `
            <tr data-product-id="${product.id}">
                <td><strong>${product.name}</strong></td>
                <td>${product.sku || product.id}</td>
                <td>${product.category}</td>
                <td class="stock-value" id="stock-${product.id}">${product.current_stock.toLocaleString()}</td>
                <td>${product.reorder_point.toLocaleString()}</td>
                <td>
                    <span class="status-badge ${product.stock_status}">
                        ${product.stock_status.toUpperCase()}
                    </span>
                </td>
                <td>$${(product.current_stock * product.unit_cost).toLocaleString()}</td>
                <td>
                    <button class="action-btn" onclick="viewProductDetails('${product.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn" onclick="showTransferDialog('${product.id}')">
                        <i class="fas fa-exchange-alt"></i> Transfer
                    </button>
                    <button class="action-btn" onclick="showAdjustDialog('${product.id}')">
                        <i class="fas fa-edit"></i> Adjust
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Load inventory graphs for specific product
     */
    async loadInventoryGraphsForProduct(productId) {
        // Get product tracking history
        const result = await apiClient.getProductTracking(productId);
        
        if (result.success) {
            // Render product tracker timeline
            this.renderProductTracker(result.data.movement_history);
            
            // Render stock level graph for this product
            this.renderProductStockLevelChart(productId, result.data.movement_history);
        }
    }

    /**
     * Render product movement tracker
     */
    renderProductTracker(movementHistory) {
        const container = document.getElementById('product-tracker');
        if (!container) return;

        if (movementHistory.length === 0) {
            container.innerHTML = '<p class="loading">No movement history available</p>';
            return;
        }

        container.innerHTML = `
            <div class="tracker-timeline">
                ${movementHistory.map(movement => `
                    <div class="tracker-event">
                        <div class="tracker-icon">
                            <i class="fas fa-${this.getMovementIcon(movement.movement_type)}"></i>
                        </div>
                        <div class="tracker-content">
                            <h4>${this.getMovementTitle(movement.movement_type)}</h4>
                            <p>${movement.reason || movement.movement_type}</p>
                            <div class="tracker-details">
                                <span><strong>Quantity:</strong> ${movement.quantity}</span>
                                ${movement.from_location ? `<span><strong>From:</strong> ${movement.from_location}</span>` : ''}
                                ${movement.to_location ? `<span><strong>To:</strong> ${movement.to_location}</span>` : ''}
                            </div>
                            <span class="tracker-time">${this.formatTime(movement.timestamp)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render stock level chart for specific product
     */
    renderProductStockLevelChart(productId, movementHistory) {
        // Extract dates and stock levels from movement history
        const dates = movementHistory.map(m => this.formatDate(m.timestamp));
        const stockLevels = movementHistory.map(m => m.quantity || 0);
        
        chartManager.createProductStockChart({
            dates: dates.reverse(),
            values: stockLevels.reverse()
        }, 'product-stock-chart');
    }

    /**
     * Load Forecasting Data with ML insights
     */
    async loadForecastingData() {
        this.showLoading();
        
        try {
            const productId = document.getElementById('product-filter-forecast')?.value || 'PROD-001';
            const periods = parseInt(document.getElementById('period-filter')?.value || '12');
            
            const result = await apiClient.getDemandPrediction(productId, periods);
            
            if (result.success) {
                const data = result.data;
                
                // Update metrics
                document.getElementById('model-accuracy').textContent = `${data.model_info.accuracy}%`;
                document.getElementById('trend-direction').textContent = 
                    data.insights.find(i => i.type === 'demand_surge' || i.type === 'demand_drop')?.message.includes('increase') ? 'Increasing' : data.forecast.trend;
                document.getElementById('peak-month').textContent = data.forecast.peak_month || 'December';
                document.getElementById('confidence-level').textContent = `${(data.model_info.confidence * 100).toFixed(0)}%`;

                // Create forecast chart
                chartManager.createForecastChart(data.historical, data.forecast);

                // Render ML-driven AI insights
                this.renderMLInsights(data.insights);
            }
        } catch (error) {
            console.error('Error loading forecast:', error);
            showNotification('Failed to load forecast data', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Render ML-driven AI insights
     */
    renderMLInsights(insights) {
        const container = document.getElementById('forecast-insights');
        if (!container) return;

        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.severity}">
                <div class="insight-icon">
                    <i class="fas fa-${this.getInsightIcon(insight.type)}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.type.replace('_', ' ').toUpperCase()}</h4>
                    <p><strong>${insight.message}</strong></p>
                    <p class="insight-recommendation">
                        <i class="fas fa-lightbulb"></i> ${insight.recommendation}
                    </p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load Alerts Data with real-time generation
     */
    async loadAlertsData() {
        this.showLoading();
        
        try {
            const severity = document.getElementById('severity-filter')?.value || null;
            const result = await apiClient.getAlerts(severity);
            
            if (result.success) {
                const data = result.data;
                
                // Update alert statistics
                document.getElementById('critical-alert-count').textContent = data.summary.critical;
                document.getElementById('warning-alert-count').textContent = data.summary.warning;
                document.getElementById('info-alert-count').textContent = data.summary.info;
                document.getElementById('total-alert-count').textContent = data.summary.total;

                // Update header badge
                this.updateAlertCounts(data.summary.critical);

                // Render alerts
                this.renderAlerts(data.alerts);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
            showNotification('Failed to load alerts', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Render alerts with enhanced UI
     */
    renderAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = '<p class="loading">No alerts found</p>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-card ${alert.severity}">
                <div class="alert-header">
                    <div class="alert-type-badge ${alert.severity}">
                        <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                        ${alert.type.replace('_', ' ')}
                    </div>
                    <span class="alert-timestamp">${this.formatTime(alert.timestamp)}</span>
                </div>
                <div class="alert-body">
                    <h4>${alert.product} - ${alert.location}</h4>
                    <p class="alert-message">${alert.message}</p>
                    <div class="alert-metadata">
                        ${alert.current_stock !== undefined ? `<span><strong>Current Stock:</strong> ${alert.current_stock}</span>` : ''}
                        ${alert.reorder_point !== undefined ? `<span><strong>Reorder Point:</strong> ${alert.reorder_point}</span>` : ''}
                    </div>
                    <div class="alert-action">
                        <i class="fas fa-tools"></i>
                        <strong>Recommended Action:</strong> ${alert.recommended_action}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load Optimization Data with ML recommendations
     */
    async loadOptimizationData() {
        this.showLoading();
        
        try {
            // Load replenishment recommendations
            const replenishmentResult = await apiClient.getReplenishmentOptimization();
            
            // Load resource allocation
            const resourceResult = await apiClient.getResourceAllocation();
            
            if (replenishmentResult.success) {
                const data = replenishmentResult.data;
                
                // Update summary metrics
                document.getElementById('items-to-reorder').textContent = data.summary.total_items;
                document.getElementById('total-investment').textContent = 
                    `$${data.summary.total_investment.toLocaleString()}`;
                document.getElementById('annual-savings').textContent = 
                    `$${data.summary.estimated_savings.toLocaleString()}`;

                // Render recommendations table
                this.renderOptimizationTable(data.recommendations);
            }

            if (resourceResult.success) {
                // Render resource allocation recommendations
                this.renderResourceAllocation(resourceResult.data.allocations);
            }
        } catch (error) {
            console.error('Error loading optimization:', error);
            showNotification('Failed to load optimization data', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Render optimization table
     */
    renderOptimizationTable(recommendations) {
        const tbody = document.getElementById('optimization-table-body');
        if (!tbody) return;

        tbody.innerHTML = recommendations.map(rec => `
            <tr>
                <td>
                    <span class="status-badge ${rec.should_reorder ? 'critical' : 'normal'}">
                        ${rec.should_reorder ? 'REORDER NOW' : 'OK'}
                    </span>
                </td>
                <td><strong>${rec.product_name}</strong></td>
                <td>${rec.current_stock.toLocaleString()}</td>
                <td class="highlight">${rec.forecast_demand.toLocaleString()}</td>
                <td>${rec.recommended_quantity.toLocaleString()}</td>
                <td>${rec.reorder_date}</td>
                <td>$${rec.cost.toLocaleString()}</td>
                <td class="text-success">$${rec.savings.toLocaleString()}</td>
                <td>
                    <button class="action-btn btn-primary" 
                            onclick="createPurchaseOrder('${rec.product_id}', ${rec.recommended_quantity})"
                            ${!rec.should_reorder ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> ${rec.should_reorder ? 'Order Now' : 'Not Needed'}
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Render resource allocation recommendations
     */
    renderResourceAllocation(allocations) {
        const container = document.getElementById('resource-allocation-container');
        if (!container) return;

        container.innerHTML = `
            <h3><i class="fas fa-users"></i> AI-Driven Resource Allocation</h3>
            <div class="allocation-grid">
                ${allocations.map(allocation => `
                    <div class="allocation-card ${allocation.priority}">
                        <div class="allocation-header">
                            <h4>${allocation.product}</h4>
                            <span class="priority-badge ${allocation.priority}">${allocation.priority.toUpperCase()}</span>
                        </div>
                        <p><i class="fas fa-cogs"></i> ${allocation.recommendation}</p>
                        <p class="allocation-impact"><strong>Impact:</strong> ${allocation.impact}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Load Suppliers Data with enhanced performance metrics
     */
    async loadSuppliersData() {
        this.showLoading();
        
        try {
            const result = await apiClient.getSupplierPerformance();
            
            if (result.success) {
                const data = result.data;
                
                // Render supplier cards
                this.renderSupplierCardsEnhanced(data.suppliers);

                // Create enhanced performance chart
                chartManager.createSupplierPerformanceChartEnhanced(data.suppliers);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            showNotification('Failed to load supplier data', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Render enhanced supplier cards
     */
    renderSupplierCardsEnhanced(suppliers) {
        const container = document.getElementById('suppliers-grid');
        if (!container) return;

        container.innerHTML = suppliers.map(supplier => `
            <div class="supplier-card">
                <div class="supplier-header">
                    <div>
                        <h3 class="supplier-name">${supplier.name}</h3>
                        <p class="supplier-category">${supplier.category}</p>
                    </div>
                    <div class="supplier-score ${this.getScoreClass(supplier.overall_score)}">
                        <div class="score-circle">${supplier.overall_score}</div>
                        <p class="score-label">Overall Score</p>
                    </div>
                </div>
                <div class="supplier-metrics">
                    <div class="metric">
                        <p class="metric-name"><i class="fas fa-truck"></i> On-Time Delivery</p>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${supplier.on_time_delivery}%"></div>
                        </div>
                        <p class="metric-value">${supplier.on_time_delivery}%</p>
                    </div>
                    <div class="metric">
                        <p class="metric-name"><i class="fas fa-star"></i> Quality Rating</p>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${supplier.quality_rating}%"></div>
                        </div>
                        <p class="metric-value">${supplier.quality_rating}%</p>
                    </div>
                    <div class="metric">
                        <p class="metric-name"><i class="fas fa-clock"></i> Lead Time</p>
                        <p class="metric-value">${supplier.lead_time_avg} days</p>
                    </div>
                    <div class="metric risk-metric">
                        <p class="metric-name"><i class="fas fa-exclamation-triangle"></i> Risk Level</p>
                        <span class="risk-badge ${supplier.risk_level}">${supplier.risk_level.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load Weather Data for specific product
     */
    async loadWeatherData() {
        this.showLoading();
        
        try {
            // Populate product selector
            await this.populateProductSelector('weather-product-selector');
            
            // Get selected product
            const productId = document.getElementById('weather-product-selector')?.value || 'PROD-001';
            
            await this.loadWeatherDataForProduct(productId);
        } catch (error) {
            console.error('Error loading weather data:', error);
            showNotification('Failed to load weather data', 'error');
        }
        
        this.hideLoading();
    }

    /**
     * Load weather data for specific product
     */
    async loadWeatherDataForProduct(productId) {
        const result = await apiClient.getWeatherImpact(productId);
        
        if (result.success) {
            const data = result.data;
            
            // Render product-specific weather impact
            this.renderProductWeatherImpact(data);
        }
    }

    /**
     * Render product-specific weather impact
     */
    renderProductWeatherImpact(data) {
        const container = document.getElementById('weather-impact-container');
        if (!container) return;

        const impactClass = data.impact.risk_level === 'high' ? 'danger' : 'success';

        container.innerHTML = `
            <div class="weather-product-info">
                <h3><i class="fas fa-box"></i> ${data.product}</h3>
                <p><i class="fas fa-industry"></i> <strong>Supplier:</strong> ${data.supplier}</p>
                <p><i class="fas fa-route"></i> <strong>Shipping Route:</strong> ${data.route}</p>
            </div>
            
            <div class="weather-impact-alert ${impactClass}">
                <div class="impact-header">
                    <i class="fas fa-${data.impact.risk_level === 'high' ? 'exclamation-triangle' : 'check-circle'}"></i>
                    <h4>${data.impact.risk_level.toUpperCase()} RISK</h4>
                </div>
                <p class="impact-message">${data.impact.message}</p>
                <div class="impact-details">
                    <span><strong>Expected Delay:</strong> ${data.impact.expected_delay}</span>
                    <span><strong>Affected Days:</strong> ${data.impact.affected_days}</span>
                </div>
            </div>

            <div class="weather-forecast-grid">
                <h4>7-Day Weather Forecast on Shipping Route</h4>
                ${data.weather_forecast.map(day => `
                    <div class="weather-day-card">
                        <p class="weather-date">${this.formatDate(day.date)}</p>
                        <div class="weather-icon">
                            <i class="fas fa-${this.getWeatherIcon(day.condition)}"></i>
                        </div>
                        <p class="weather-condition">${day.condition}</p>
                        <p class="weather-temp">${day.temp}°C</p>
                        <p class="weather-delay-risk ${day.delay_risk > 0.3 ? 'high-risk' : 'low-risk'}">
                            Delay Risk: ${(day.delay_risk * 100).toFixed(0)}%
                        </p>
                    </div>
                `).join('')}
            </div>

            <div class="weather-recommendations">
                <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                <ul>
                    ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    // ... continuing dashboard.js

    /**
     * Update alert counts in real-time
     */
    updateAlertCounts(count) {
        const headerBadge = document.getElementById('alert-count');
        const sidebarBadge = document.getElementById('sidebar-alert-count');
        
        if (headerBadge) headerBadge.textContent = count;
        if (sidebarBadge) sidebarBadge.textContent = count;

        // Pulse animation for new alerts
        if (count > 0) {
            headerBadge?.classList.add('pulse');
            setTimeout(() => headerBadge?.classList.remove('pulse'), 2000);
        }
    }

    /**
     * Helper: Get alert icon
     */
    getAlertIcon(type) {
        const icons = {
            'stockout_risk': 'exclamation-triangle',
            'reorder_required': 'shopping-cart',
            'overstock': 'boxes',
            'supplier_delay': 'truck',
            'weather_impact': 'cloud-rain',
            'demand_spike': 'chart-line',
            'unusual_consumption': 'chart-bar',
            'quality_issue': 'times-circle',
            'location_capacity': 'warehouse'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Helper: Get movement icon
     */
    getMovementIcon(type) {
        const icons = {
            'transfer': 'exchange-alt',
            'adjustment': 'edit',
            'product_added': 'plus-circle',
            'product_removed': 'minus-circle',
            'received': 'truck',
            'shipped': 'shipping-fast'
        };
        return icons[type] || 'box';
    }

    /**
     * Helper: Get movement title
     */
    getMovementTitle(type) {
        const titles = {
            'transfer': 'Stock Transfer',
            'adjustment': 'Stock Adjustment',
            'product_added': 'Product Added',
            'product_removed': 'Product Removed',
            'received': 'Stock Received',
            'shipped': 'Stock Shipped'
        };
        return titles[type] || type;
    }

    /**
     * Helper: Get insight icon
     */
    getInsightIcon(type) {
        const icons = {
            'demand_surge': 'arrow-up',
            'demand_drop': 'arrow-down',
            'seasonality': 'calendar-alt',
            'trend_change': 'chart-line'
        };
        return icons[type] || 'lightbulb';
    }

    /**
     * Helper: Get weather icon
     */
    getWeatherIcon(condition) {
        const icons = {
            'Clear': 'sun',
            'Rainy': 'cloud-rain',
            'Stormy': 'bolt',
            'Snow': 'snowflake',
            'Cloudy': 'cloud'
        };
        return icons[condition] || 'cloud';
    }

    /**
     * Helper: Get score class
     */
    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'average';
        return 'poor';
    }

    /**
     * Helper: Format time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    /**
     * Helper: Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('active');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            console.log('Auto-refreshing data...');
            this.loadSectionData(this.currentSection);
        }, 300000);
    }

    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// Create global dashboard instance
const dashboard = new Dashboard();


