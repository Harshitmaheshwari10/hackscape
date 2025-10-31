"""
Data Processing Utilities
"""

import pandas as pd
import numpy as np
from datetime import datetime

class DataProcessor:
    """Utility class for data processing and transformation"""
    
    @staticmethod
    def clean_demand_data(data):
        """Clean and validate demand data"""
        df = pd.DataFrame(data)
        
        # Remove null values
        df = df.dropna()
        
        # Remove negative values
        df = df[df['demand'] >= 0]
        
        # Sort by date
        df = df.sort_values('date')
        
        return df.to_dict('records')
    
    @staticmethod
    def calculate_moving_average(values, window=7):
        """Calculate moving average for demand smoothing"""
        return pd.Series(values).rolling(window=window, min_periods=1).mean().tolist()
    
    @staticmethod
    def detect_outliers(values, threshold=2.5):
        """Detect outliers using standard deviation method"""
        mean = np.mean(values)
        std = np.std(values)
        
        outliers = []
        for i, value in enumerate(values):
            z_score = abs((value - mean) / std) if std > 0 else 0
            if z_score > threshold:
                outliers.append({'index': i, 'value': value, 'z_score': z_score})
        
        return outliers
    
    @staticmethod
    def calculate_forecast_accuracy(actual, predicted):
        """Calculate various accuracy metrics"""
        actual = np.array(actual)
        predicted = np.array(predicted)
        
        mae = np.mean(np.abs(actual - predicted))
        mse = np.mean((actual - predicted) ** 2)
        rmse = np.sqrt(mse)
        mape = np.mean(np.abs((actual - predicted) / actual)) * 100 if np.all(actual != 0) else 0
        
        return {
            'MAE': round(mae, 2),
            'MSE': round(mse, 2),
            'RMSE': round(rmse, 2),
            'MAPE': round(mape, 2)
        }
