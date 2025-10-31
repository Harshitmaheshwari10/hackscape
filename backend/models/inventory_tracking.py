"""
Enhanced Inventory Tracking with Movement History and Dynamic Operations
"""

from datetime import datetime
import random

class InventoryTracker:
    """Enhanced real-time inventory tracking and management system"""
    
    def __init__(self):
        self.locations = self._initialize_locations()
        self.products = self._initialize_products()
        self.movement_history = []  # Track all stock movements
        self.sales_history = {}  # Track sales for ML forecasting
        
    def _initialize_locations(self):
        """Initialize warehouse/distribution center locations"""
        return [
            {
                'id': 'WH-001',
                'name': 'Warehouse North',
                'type': 'warehouse',
                'capacity': 10000,
                'current_stock': 7500,
                'address': 'Industrial Area, North Zone',
                'manager': 'John Smith'
            },
            {
                'id': 'WH-002',
                'name': 'Warehouse South',
                'type': 'warehouse',
                'capacity': 8000,
                'current_stock': 5200,
                'address': 'Port Area, South Zone',
                'manager': 'Sarah Johnson'
            },
            {
                'id': 'DC-001',
                'name': 'Distribution Center East',
                'type': 'distribution_center',
                'capacity': 15000,
                'current_stock': 12300,
                'address': 'Highway 101, East Zone',
                'manager': 'Mike Chen'
            },
            {
                'id': 'DC-002',
                'name': 'Distribution Center West',
                'type': 'distribution_center',
                'capacity': 12000,
                'current_stock': 9800,
                'address': 'Business Park, West Zone',
                'manager': 'Emily Davis'
            }
        ]
    
    def _initialize_products(self):
        """Initialize product catalog with inventory data"""
        return [
            {
                'id': 'PROD-001',
                'name': 'Electronics Components',
                'category': 'Electronics',
                'sku': 'ELEC-001-2025',
                'current_stock': 1250,
                'reorder_point': 500,
                'safety_stock': 200,
                'max_stock': 2000,
                'unit_cost': 25.50,
                'unit_price': 45.99,
                'supplier': 'Global Electronics Ltd',
                'lead_time_days': 5,
                'demand_trend': 'increasing'
            },
            {
                'id': 'PROD-002',
                'name': 'Automotive Parts',
                'category': 'Automotive',
                'sku': 'AUTO-002-2025',
                'current_stock': 850,
                'reorder_point': 300,
                'safety_stock': 150,
                'max_stock': 1500,
                'unit_cost': 45.75,
                'unit_price': 89.99,
                'supplier': 'AutoParts International',
                'lead_time_days': 7,
                'demand_trend': 'stable'
            },
            {
                'id': 'PROD-003',
                'name': 'Medical Supplies',
                'category': 'Healthcare',
                'sku': 'MED-003-2025',
                'current_stock': 2100,
                'reorder_point': 800,
                'safety_stock': 400,
                'max_stock': 3000,
                'unit_cost': 12.25,
                'unit_price': 24.99,
                'supplier': 'MedSupply Corp',
                'lead_time_days': 3,
                'demand_trend': 'seasonal'
            },
            {
                'id': 'PROD-004',
                'name': 'Industrial Tools',
                'category': 'Industrial',
                'sku': 'IND-004-2025',
                'current_stock': 450,
                'reorder_point': 200,
                'safety_stock': 100,
                'max_stock': 800,
                'unit_cost': 78.50,
                'unit_price': 149.99,
                'supplier': 'Tools & Equipment Inc',
                'lead_time_days': 10,
                'demand_trend': 'stable'
            },
            {
                'id': 'PROD-005',
                'name': 'Consumer Goods',
                'category': 'Consumer',
                'sku': 'CONS-005-2025',
                'current_stock': 3200,
                'reorder_point': 1000,
                'safety_stock': 500,
                'max_stock': 5000,
                'unit_cost': 8.99,
                'unit_price': 17.99,
                'supplier': 'Consumer Products Ltd',
                'lead_time_days': 4,
                'demand_trend': 'increasing'
            }
        ]
    
    def add_product(self, product_data):
        """Add new product to inventory"""
        new_product = {
            'id': f"PROD-{len(self.products) + 1:03d}",
            'name': product_data.get('name'),
            'category': product_data.get('category'),
            'sku': product_data.get('sku', f"SKU-{len(self.products) + 1:03d}"),
            'current_stock': product_data.get('current_stock', 0),
            'reorder_point': product_data.get('reorder_point', 100),
            'safety_stock': product_data.get('safety_stock', 50),
            'max_stock': product_data.get('max_stock', 1000),
            'unit_cost': product_data.get('unit_cost', 10.0),
            'unit_price': product_data.get('unit_price', 20.0),
            'supplier': product_data.get('supplier', 'Unknown'),
            'lead_time_days': product_data.get('lead_time_days', 5),
            'demand_trend': 'stable'
        }
        
        self.products.append(new_product)
        
        # Log the addition
        self.log_movement(
            product_id=new_product['id'],
            movement_type='product_added',
            quantity=new_product['current_stock'],
            reason='New product added to system'
        )
        
        return new_product
    
    def remove_product(self, product_id):
        """Remove product from inventory"""
        product = self.get_product_by_id(product_id)
        
        if product:
            self.products = [p for p in self.products if p['id'] != product_id]
            
            # Log the removal
            self.log_movement(
                product_id=product_id,
                movement_type='product_removed',
                quantity=0,
                reason='Product discontinued'
            )
            
            return True
        return False
    
    def transfer_stock(self, product_id, from_location, to_location, quantity):
        """Transfer stock between locations"""
        product = self.get_product_by_id(product_id)
        
        if not product:
            return {'success': False, 'error': 'Product not found'}
        
        if product['current_stock'] < quantity:
            return {'success': False, 'error': 'Insufficient stock for transfer'}
        
        # Update product stock (in real app, would update location-specific stock)
        # For demo, we simulate the transfer
        
        return {
            'success': True,
            'product_id': product_id,
            'from': from_location,
            'to': to_location,
            'quantity': quantity,
            'timestamp': datetime.now().isoformat()
        }
    
    def adjust_stock(self, product_id, adjustment, reason='Manual adjustment'):
        """Adjust stock levels (positive or negative)"""
        product = self.get_product_by_id(product_id)
        
        if not product:
            return {'success': False, 'error': 'Product not found'}
        
        new_stock = product['current_stock'] + adjustment
        
        if new_stock < 0:
            return {'success': False, 'error': 'Cannot reduce stock below zero'}
        
        # Update stock
        product['current_stock'] = new_stock
        
        return {
            'success': True,
            'product_id': product_id,
            'previous_stock': product['current_stock'] - adjustment,
            'new_stock': new_stock,
            'adjustment': adjustment,
            'reason': reason,
            'timestamp': datetime.now().isoformat()
        }
    
    def log_movement(self, product_id, movement_type, quantity, **kwargs):
        """Log stock movement for tracking"""
        movement = {
            'id': f"MOV-{len(self.movement_history) + 1:06d}",
            'product_id': product_id,
            'movement_type': movement_type,
            'quantity': quantity,
            'timestamp': datetime.now().isoformat(),
            **kwargs
        }
        
        self.movement_history.append(movement)
        return movement
    
    def get_movement_history(self, product_id=None, limit=50):
        """Get movement history for a product or all products"""
        if product_id:
            history = [m for m in self.movement_history if m['product_id'] == product_id]
        else:
            history = self.movement_history
        
        # Sort by timestamp (most recent first)
        history = sorted(history, key=lambda x: x['timestamp'], reverse=True)
        
        return history[:limit]
    
    def get_sales_history(self, product_id, months=24):
        """Get or generate sales history for ML forecasting"""
        if product_id not in self.sales_history:
            # Generate synthetic sales data
            self.sales_history[product_id] = self._generate_sales_data(product_id, months)
        
        return self.sales_history[product_id]
    
    def _generate_sales_data(self, product_id, months):
        """Generate realistic sales data for ML training"""
        from datetime import timedelta
        
        product = self.get_product_by_id(product_id)
        if not product:
            return {'dates': [], 'values': []}
        
        base_demand = product['current_stock']
        seasonality = {
            1: 0.85, 2: 0.90, 3: 1.05, 4: 1.10, 5: 1.15, 6: 1.20,
            7: 1.25, 8: 1.15, 9: 1.05, 10: 0.95, 11: 0.90, 12: 0.85
        }
        
        dates = []
        values = []
        
        for i in range(months):
            date = datetime.now() - timedelta(days=30 * (months - i))
            month = date.month
            
            # Apply trend
            if product['demand_trend'] == 'increasing':
                trend_factor = 1 + (i * 0.02)
            elif product['demand_trend'] == 'decreasing':
                trend_factor = 1 - (i * 0.01)
            else:
                trend_factor = 1
            
            # Apply seasonality
            seasonal_factor = seasonality.get(month, 1.0)
            
            # Add randomness
            noise = random.uniform(0.9, 1.1)
            
            demand = base_demand * trend_factor * seasonal_factor * noise
            
            dates.append(date.strftime('%Y-%m'))
            values.append(round(demand, 2))
        
        return {'dates': dates, 'values': values}
    
    def get_stock_status(self, product_id):
        """Determine stock status based on current levels"""
        product = self.get_product_by_id(product_id)
        if not product:
            return 'unknown'
        
        current = product['current_stock']
        safety = product['safety_stock']
        reorder = product['reorder_point']
        max_stock = product.get('max_stock', reorder * 3)
        
        if current <= safety:
            return 'critical'
        elif current <= reorder:
            return 'low'
        elif current > max_stock:
            return 'overstock'
        else:
            return 'normal'
    
    def get_product_by_id(self, product_id):
        """Get product details by ID"""
        return next((p for p in self.products if p['id'] == product_id), None)
    
    def get_location_by_id(self, location_id):
        """Get location details by ID"""
        return next((l for l in self.locations if l['id'] == location_id), None)
    
    def calculate_inventory_value(self):
        """Calculate total inventory value"""
        return sum(p['current_stock'] * p['unit_cost'] for p in self.products)
    
    def get_low_stock_products(self):
        """Get list of products with low stock"""
        return [
            p for p in self.products 
            if self.get_stock_status(p['id']) in ['critical', 'low']
        ]
    
    def get_overstock_products(self):
        """Get list of products with overstock"""
        return [
            p for p in self.products 
            if self.get_stock_status(p['id']) == 'overstock'
        ]
    
    def add_location(self, location_data):
        """Add new inventory location"""
        new_location = {
            'id': f"LOC-{len(self.locations) + 1:03d}",
            'name': location_data.get('name'),
            'type': location_data.get('type', 'warehouse'),
            'capacity': location_data.get('capacity', 10000),
            'current_stock': 0,
            'address': location_data.get('address', 'Unknown'),
            'manager': location_data.get('manager', 'TBD')
        }
        
        self.locations.append(new_location)
        return new_location
