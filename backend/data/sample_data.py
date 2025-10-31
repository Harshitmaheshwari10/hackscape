"""
Sample Data Generator for Demo and Testing
"""

import numpy as np
import random
from datetime import datetime, timedelta

class SampleDataGenerator:
    """Generate realistic sample data for dashboard demonstration"""
    
    def __init__(self):
        self.seasonality_factors = {
            1: 0.85, 2: 0.90, 3: 1.05, 4: 1.10,
            5: 1.15, 6: 1.20, 7: 1.25, 8: 1.15,
            9: 1.05, 10: 0.95, 11: 0.90, 12: 0.85
        }
    
    def generate_historical_demand(self, product_id='PROD-001', months=24):
        """Generate historical demand data with trend and seasonality"""
        base_demand = random.randint(800, 1200)
        trend = random.uniform(-2, 5)  # Monthly trend
        
        dates = []
        values = []
        
        for i in range(months):
            # Calculate date
            date = datetime.now() - timedelta(days=30 * (months - i))
            dates.append(date.strftime('%Y-%m'))
            
            # Calculate demand with trend and seasonality
            month = date.month
            seasonal_factor = self.seasonality_factors.get(month, 1.0)
            
            demand = base_demand + (trend * i)
            demand = demand * seasonal_factor
            
            # Add random noise
            noise = random.uniform(-50, 50)
            demand += noise
            
            # Ensure non-negative
            demand = max(100, demand)
            
            values.append(round(demand, 2))
        
        return {
            'dates': dates,
            'values': values
        }
    
    def generate_stock_movements(self, products, days=30):
        """Generate daily stock movement data"""
        movements = []
        
        for day in range(days):
            date = (datetime.now() - timedelta(days=days - day)).strftime('%Y-%m-%d')
            day_movements = {}
            
            for product in products:
                # Simulate daily stock changes
                incoming = random.randint(0, 200) if random.random() > 0.7 else 0
                outgoing = random.randint(50, 150)
                net_change = incoming - outgoing
                
                # Simulate current stock for that day
                simulated_stock = product['current_stock'] + random.randint(-100, 100)
                simulated_stock = max(0, simulated_stock)
                
                day_movements[product['id']] = {
                    'product_name': product['name'],
                    'incoming': incoming,
                    'outgoing': outgoing,
                    'net_change': net_change,
                    'closing_stock': simulated_stock
                }
            
            movements.append({
                'date': date,
                'movements': day_movements
            })
        
        return movements
    
    def generate_supplier_data(self):
        """Generate supplier performance data"""
        suppliers = [
            {
                'id': 'SUP-001',
                'name': 'Global Electronics Ltd',
                'category': 'Electronics',
                'performance_score': random.randint(85, 98),
                'on_time_delivery': random.randint(88, 98),
                'quality_rating': random.randint(85, 95),
                'lead_time_avg': round(random.uniform(3, 7), 1),
                'cost_competitiveness': random.randint(80, 95),
                'reliability': 'High',
                'total_orders': random.randint(150, 300),
                'defect_rate': round(random.uniform(0.5, 2.5), 2)
            },
            {
                'id': 'SUP-002',
                'name': 'AutoParts International',
                'category': 'Automotive',
                'performance_score': random.randint(82, 94),
                'on_time_delivery': random.randint(85, 95),
                'quality_rating': random.randint(82, 92),
                'lead_time_avg': round(random.uniform(5, 9), 1),
                'cost_competitiveness': random.randint(78, 90),
                'reliability': 'High',
                'total_orders': random.randint(120, 250),
                'defect_rate': round(random.uniform(1.0, 3.5), 2)
            },
            {
                'id': 'SUP-003',
                'name': 'MedSupply Corp',
                'category': 'Healthcare',
                'performance_score': random.randint(90, 98),
                'on_time_delivery': random.randint(92, 99),
                'quality_rating': random.randint(90, 98),
                'lead_time_avg': round(random.uniform(2, 5), 1),
                'cost_competitiveness': random.randint(75, 85),
                'reliability': 'Very High',
                'total_orders': random.randint(200, 400),
                'defect_rate': round(random.uniform(0.2, 1.5), 2)
            },
            {
                'id': 'SUP-004',
                'name': 'Tools & Equipment Inc',
                'category': 'Industrial',
                'performance_score': random.randint(80, 92),
                'on_time_delivery': random.randint(83, 93),
                'quality_rating': random.randint(85, 93),
                'lead_time_avg': round(random.uniform(7, 12), 1),
                'cost_competitiveness': random.randint(82, 92),
                'reliability': 'Medium',
                'total_orders': random.randint(80, 180),
                'defect_rate': round(random.uniform(1.5, 4.0), 2)
            },
            {
                'id': 'SUP-005',
                'name': 'Consumer Products Ltd',
                'category': 'Consumer',
                'performance_score': random.randint(85, 95),
                'on_time_delivery': random.randint(87, 96),
                'quality_rating': random.randint(83, 92),
                'lead_time_avg': round(random.uniform(3, 6), 1),
                'cost_competitiveness': random.randint(85, 95),
                'reliability': 'High',
                'total_orders': random.randint(180, 350),
                'defect_rate': round(random.uniform(0.8, 2.8), 2)
            }
        ]
        
        return suppliers
