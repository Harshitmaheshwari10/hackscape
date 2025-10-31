"""
Configuration settings for the application
"""

import os

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-for-hackathon-2025'
    DEBUG = True
    
    # Database settings (for future expansion)
    DATABASE_URI = 'sqlite:///demand_forecasting.db'
    
    # API settings
    API_PREFIX = '/api'
    API_VERSION = 'v1'
    
    # Model settings
    MODEL_PATH = 'models/saved_models/'
    DATA_PATH = 'data/sample_data/'
    
    # Alert thresholds
    CRITICAL_STOCK_THRESHOLD = 0.2  # 20% of reorder point
    LOW_STOCK_THRESHOLD = 1.0  # At reorder point
    HIGH_STOCK_THRESHOLD = 2.0  # 2x reorder point
    
    # Forecasting settings
    FORECAST_PERIODS = 12
    HISTORICAL_PERIODS = 24
    CONFIDENCE_LEVEL = 0.95
    
    # External data API keys (for future integration)
    WEATHER_API_KEY = 'your-weather-api-key'
    MARKET_DATA_API_KEY = 'your-market-api-key'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

# Default config
config = DevelopmentConfig()
