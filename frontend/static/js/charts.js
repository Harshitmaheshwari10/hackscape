/**
 * Enhanced Chart Manager with All Chart Types
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.defaultColors = {
            primary: '#4f46e5',
            secondary: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            success: '#10b981',
            purple: '#8b5cf6'
        };
    }

    /**
     * Create inventory distribution chart
     */
    createInventoryDistributionChart(data) {
        const ctx = document.getElementById('inventory-distribution-chart');
        if (!ctx) return;

        if (this.charts.inventoryDistribution) {
            this.charts.inventoryDistribution.destroy();
        }

        this.charts.inventoryDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        this.defaultColors.primary,
                        this.defaultColors.secondary,
                        this.defaultColors.info,
                        this.defaultColors.warning,
                        this.defaultColors.purple
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} units (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create demand trend chart
     */
    createDemandTrendChart(historicalData, forecastData, chartId = 'demand-trend-chart') {
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        if (this.charts.demandTrend) {
            this.charts.demandTrend.destroy();
        }

        const allDates = [...historicalData.dates.slice(-6), ...forecastData.dates.slice(0, 6)];
        const historicalValues = [...historicalData.values.slice(-6), ...new Array(6).fill(null)];
        const forecastValues = [...new Array(6).fill(null), ...forecastData.predictions.slice(0, 6)];

        this.charts.demandTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allDates,
                datasets: [
                    {
                        label: 'Historical Demand',
                        data: historicalValues,
                        borderColor: this.defaultColors.primary,
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Forecast',
                        data: forecastValues,
                        borderColor: this.defaultColors.secondary,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return value !== null ? `${context.dataset.label}: ${value.toLocaleString()} units` : '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Create forecast chart with confidence intervals
     */
    createForecastChart(historical, forecast) {
        const ctx = document.getElementById('forecast-chart');
        if (!ctx) return;

        if (this.charts.forecast) {
            this.charts.forecast.destroy();
        }

        const allDates = [...historical.dates, ...forecast.dates];
        const historicalValues = [...historical.values, ...new Array(forecast.dates.length).fill(null)];
        const forecastValues = [...new Array(historical.dates.length).fill(null), ...forecast.predictions];
        
        const upperBound = [...new Array(historical.dates.length).fill(null), 
            ...forecast.confidence_intervals.map(ci => ci.upper)];
        const lowerBound = [...new Array(historical.dates.length).fill(null), 
            ...forecast.confidence_intervals.map(ci => ci.lower)];

        this.charts.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allDates,
                datasets: [
                    {
                        label: 'Historical Demand',
                        data: historicalValues,
                        borderColor: this.defaultColors.primary,
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderWidth: 3,
                        pointRadius: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'ML Forecast',
                        data: forecastValues,
                        borderColor: this.defaultColors.secondary,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        pointRadius: 4,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Upper Confidence (95%)',
                        data: upperBound,
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderWidth: 1,
                        borderDash: [2, 2],
                        pointRadius: 0,
                        tension: 0.4,
                        fill: '+1'
                    },
                    {
                        label: 'Lower Confidence (95%)',
                        data: lowerBound,
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderWidth: 1,
                        borderDash: [2, 2],
                        pointRadius: 0,
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label.includes('Confidence')) {
                                    return null;
                                }
                                const value = context.parsed.y;
                                return value !== null ? `${context.dataset.label}: ${value.toFixed(0)} units` : '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Create product-specific stock level chart
     */
    createProductStockChart(data, chartId) {
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        if (this.charts.productStock) {
            this.charts.productStock.destroy();
        }

        this.charts.productStock = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [{
                    label: 'Stock Level',
                    data: data.values,
                    borderColor: this.defaultColors.info,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Create enhanced supplier performance chart
     */
    createSupplierPerformanceChartEnhanced(suppliers) {
        const ctx = document.getElementById('supplier-performance-chart');
        if (!ctx) return;

        if (this.charts.supplierPerformance) {
            this.charts.supplierPerformance.destroy();
        }

        // Create horizontal bar chart for better clarity
        this.charts.supplierPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: suppliers.map(s => s.name),
                datasets: [
                    {
                        label: 'On-Time Delivery %',
                        data: suppliers.map(s => s.on_time_delivery),
                        backgroundColor: this.defaultColors.success,
                        borderWidth: 0
                    },
                    {
                        label: 'Quality Rating %',
                        data: suppliers.map(s => s.quality_rating),
                        backgroundColor: this.defaultColors.info,
                        borderWidth: 0
                    },
                    {
                        label: 'Overall Score',
                        data: suppliers.map(s => s.overall_score),
                        backgroundColor: this.defaultColors.primary,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.x}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    /**
     * Helper: Get color by index
     */
    getColorByIndex(index, alpha = 1) {
        const colors = Object.values(this.defaultColors);
        const color = colors[index % colors.length];
        
        if (alpha === 1) return color;
        
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// Create global chart manager instance
const chartManager = new ChartManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartManager, chartManager };
}
