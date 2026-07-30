"""
Enhanced Main runner script with SocketIO support
"""

import sys
import os
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import app, socketio

if __name__ == '__main__':
    print("="*60)
    print("🚀 Starting AI Demand Forecasting Dashboard...")
    print("="*60)
    print("📊 Dashboard URL: http://localhost:5000")
    print("📡 API Base URL: http://localhost:5000/api")
    print("🔌 WebSocket: Enabled (Real-time updates)")
    print("="*60)
    print("\n💡 Press CTRL+C to stop the server\n")
    
    # Run with SocketIO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
