"""
Enhanced Alert System with Real-time Generation and Multiple Alert Types
"""

from datetime import datetime
import random

class EnhancedAlertSystem:
    """Advanced automated alert generation and management system"""
    
    def __init__(self, inventory_tracker):
        self.inventory_tracker = inventory_tracker
        self.alert_history = []
        self.alert_types = {
            'stockout_risk': 'Stock level critically low',
            'reorder_required': 'Reorder point reached',
            'overstock': 'Stock level exceeds maximum',
            'unusual_consumption': 'Unusual consumption pattern detected',
            'supplier_delay': 'Supplier delivery delay',
            'weather_impact': 'Weather may impact operations',
            'demand_spike': 'Unexpected demand increase',
            'quality_issue': 'Quality concerns reported',
            'expiry_warning': 'Products nearing expiry',
            'location_capacity': 'Location capacity warning'
        }
    
    def generate_alerts(self):
        """Generate all current alerts based on inventory status"""
        alerts = []
        
        # Stock-level alerts
        alerts.extend(self._check_stock_levels())
        
        # Overstock alerts
        alerts.extend(self._check_overstock())
        
        # Demand spike alerts
        alerts.extend(self._check_demand_spikes())
        
        # Supplier alerts
        alerts.extend(self._check_supplier_issues())
        
        # Weather alerts
        alerts.extend(self._check_weather_impacts())
        
        # Location capacity alerts
        alerts.extend(self._check_location_capacity())
        
        # Sort by severity (critical first)
        severity_order = {'critical': 0, 'warning': 1, 'info': 2}
        alerts.sort(key=lambda x: severity_order.get(x['severity'], 3))
        
        # Store in history
        for alert in alerts:
            if not any(a['id'] == alert['id'] for a in self.alert_history):
                self.alert_history.append(alert)
        
        return alerts
    
    def _check_stock_levels(self):
        """Check for low stock and critical stock levels"""
        alerts = []
        
        for product in self.inventory_tracker.products:
            stock_status = self.inventory_tracker.get_stock_status(product['id'])
            
            if stock_status == 'critical':
                alerts.append(self._create_alert(
                    alert_type='stockout_risk',
                    severity='critical',
                    product=product,
                    message=f"CRITICAL: Stock at {product['current_stock']} units (Safety stock: {product['safety_stock']})",
                    action=f"IMMEDIATE ACTION REQUIRED: Reorder {product['reorder_point'] * 2} units within 24 hours",
                    priority=1
                ))
            
            elif stock_status == 'low':
                alerts.append(self._create_alert(
                    alert_type='reorder_required',
                    severity='warning',
                    product=product,
                    message=f"Stock below reorder point: {product['current_stock']} units (Reorder at: {product['reorder_point']})",
                    action=f"Place order for {product['reorder_point']} units. Lead time: {product['lead_time_days']} days",
                    priority=2
                ))
        
        return alerts
    
    def _check_overstock(self):
        """Check for overstock situations"""
        alerts = []
        
        for product in self.inventory_tracker.products:
            stock_status = self.inventory_tracker.get_stock_status(product['id'])
            
            if stock_status == 'overstock':
                max_stock = product.get('max_stock', product['reorder_point'] * 2)
                excess = product['current_stock'] - max_stock
                
                alerts.append(self._create_alert(
                    alert_type='overstock',
                    severity='info',
                    product=product,
                    message=f"Overstock detected: {product['current_stock']} units ({excess} above optimal level)",
                    action=f"Consider: 1) Promotional campaign to increase sales, 2) Transfer {excess//2} units to high-demand location, 3) Review reorder quantities",
                    priority=3
                ))
        
        return alerts
    
    def _check_demand_spikes(self):
        """Check for unusual demand patterns"""
        alerts = []
        
        # Randomly simulate demand spike detection (in production, use ML)
        if random.random() > 0.7:
            product = random.choice(self.inventory_tracker.products)
            spike_percent = random.randint(20, 50)
            
            alerts.append({
                'id': f"ALERT-SPIKE-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'type': 'demand_spike',
                'severity': 'warning',
                'product': product['name'],
                'product_id': product['id'],
                'category': product['category'],
                'location': 'Multiple Locations',
                'message': f"Demand spike detected: {spike_percent}% increase over normal levels",
                'timestamp': datetime.now().isoformat(),
                'recommended_action': f"Increase stock allocation by {spike_percent}% and expedite next shipment",
                'priority': 2,
                'metadata': {
                    'spike_percentage': spike_percent,
                    'current_demand': product['current_stock'],
                    'predicted_demand': int(product['current_stock'] * (1 + spike_percent/100))
                }
            })
        
        return alerts
    
    def _check_supplier_issues(self):
        """Check for supplier-related issues"""
        alerts = []
        
        # Simulate supplier delay (in production, integrate with supplier API)
        if random.random() > 0.8:
            product = random.choice(self.inventory_tracker.products)
            delay_days = random.randint(1, 5)
            
            alerts.append({
                'id': f"ALERT-SUPPLIER-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'type': 'supplier_delay',
                'severity': 'warning',
                'product': product['name'],
                'product_id': product['id'],
                'category': product['category'],
                'location': product['supplier'],
                'message': f"Supplier '{product['supplier']}' reporting {delay_days}-day delay",
                'timestamp': datetime.now().isoformat(),
                'recommended_action': f"1) Contact alternative suppliers, 2) Inform customers of potential delays, 3) Adjust safety stock levels",
                'priority': 2,
                'metadata': {
                    'supplier': product['supplier'],
                    'delay_days': delay_days,
                    'original_lead_time': product['lead_time_days'],
                    'new_lead_time': product['lead_time_days'] + delay_days
                }
            })
        
        return alerts
    
    def _check_weather_impacts(self):
        """Check for weather-related impacts"""
        alerts = []
        
        # Simulate weather alert
        if random.random() > 0.75:
            weather_conditions = ['Heavy rainfall', 'Snowstorm', 'Tropical storm', 'Severe winds']
            condition = random.choice(weather_conditions)
            impact_areas = random.sample(['Distribution Center East', 'Warehouse North', 'Supplier Route'], 2)
            
            alerts.append({
                'id': f"ALERT-WEATHER-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                'type': 'weather_impact',
                'severity': 'warning',
                'product': 'Multiple Products',
                'location': ', '.join(impact_areas),
                'message': f"{condition} predicted in operational areas - potential delivery delays",
                'timestamp': datetime.now().isoformat(),
                'recommended_action': "1) Increase safety stock by 15-20%, 2) Activate backup shipping routes, 3) Prepare contingency plans",
                'priority': 2,
                'metadata': {
                    'weather_condition': condition,
                    'affected_areas': impact_areas,
                    'duration_days': random.randint(2, 4),
                    'delay_risk': random.uniform(0.3, 0.7)
                }
            })
        
        return alerts
    
    def _check_location_capacity(self):
        """Check for location capacity warnings"""
        alerts = []
        
        for location in self.inventory_tracker.locations:
            utilization = (location['current_stock'] / location['capacity']) * 100
            
            if utilization > 90:
                alerts.append({
                    'id': f"ALERT-CAPACITY-{location['id']}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    'type': 'location_capacity',
                    'severity': 'warning',
                    'product': 'Location Capacity',
                    'location': location['name'],
                    'message': f"Capacity at {utilization:.1f}% - approaching maximum",
                    'timestamp': datetime.now().isoformat(),
                    'recommended_action': f"1) Transfer stock to alternative locations, 2) Expedite shipments, 3) Review storage optimization",
                    'priority': 2,
                    'metadata': {
                        'location_id': location['id'],
                        'current_utilization': round(utilization, 1),
                        'current_stock': location['current_stock'],
                        'capacity': location['capacity'],
                        'available_space': location['capacity'] - location['current_stock']
                    }
                })
        
        return alerts
    
    def _create_alert(self, alert_type, severity, product, message, action, priority=2):
        """Create a standardized alert object"""
        return {
            'id': f"ALERT-{product['id']}-{alert_type.upper()}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'type': alert_type,
            'severity': severity,
            'product': product['name'],
            'product_id': product['id'],
            'category': product['category'],
            'location': 'All Locations',
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'recommended_action': action,
            'current_stock': product['current_stock'],
            'reorder_point': product['reorder_point'],
            'safety_stock': product['safety_stock'],
            'status': 'active',
            'priority': priority
        }
    
    def get_alerts_by_severity(self, severity):
        """Filter alerts by severity level"""
        all_alerts = self.generate_alerts()
        return [a for a in all_alerts if a['severity'] == severity]
    
    def get_alerts_by_product(self, product_id):
        """Filter alerts by product ID"""
        all_alerts = self.generate_alerts()
        return [a for a in all_alerts if a.get('product_id') == product_id]
    
    def get_alert_count_by_severity(self):
        """Get count of alerts by severity"""
        alerts = self.generate_alerts()
        return {
            'critical': len([a for a in alerts if a['severity'] == 'critical']),
            'warning': len([a for a in alerts if a['severity'] == 'warning']),
            'info': len([a for a in alerts if a['severity'] == 'info']),
            'total': len(alerts)
        }
    
    def clear_alert(self, alert_id):
        """Mark an alert as cleared"""
        for alert in self.alert_history:
            if alert['id'] == alert_id:
                alert['status'] = 'cleared'
                alert['cleared_at'] = datetime.now().isoformat()
                return True
        return False
