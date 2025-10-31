"""
Helper utility functions
"""

from datetime import datetime
import json

def format_currency(amount, currency='USD'):
    """Format number as currency"""
    symbols = {'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹'}
    symbol = symbols.get(currency, '$')
    return f"{symbol}{amount:,.2f}"

def format_date(date_obj, format_str='%Y-%m-%d'):
    """Format datetime object as string"""
    if isinstance(date_obj, str):
        date_obj = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
    return date_obj.strftime(format_str)

def calculate_percentage(value, total):
    """Calculate percentage"""
    if total == 0:
        return 0
    return round((value / total) * 100, 2)

def safe_divide(numerator, denominator, default=0):
    """Safely divide two numbers"""
    try:
        return numerator / denominator if denominator != 0 else default
    except (TypeError, ZeroDivisionError):
        return default

def generate_response(data, message='Success', status_code=200):
    """Generate standardized API response"""
    return {
        'status': 'success' if status_code < 400 else 'error',
        'message': message,
        'data': data,
        'timestamp': datetime.now().isoformat()
    }, status_code

def validate_date_range(start_date, end_date):
    """Validate date range"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        return start <= end
    except (ValueError, TypeError):
        return False
