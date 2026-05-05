# -*- coding: utf-8 -*-
"""
Created on Sat Jun 7 2025
@author: saurabh
Purpose: Send a model-ready row to deployed ML endpoint for prediction
"""

import json
import requests

# Model endpoint (change if needed)
url = 'http://127.0.0.1:8000/eta_prediction'

# Input data: preprocessed & encoded (as your model expects)
input_data_for_model = {
    "source_lat": 22.735794,
    "source_lon": 75.825437,
    "dest_lat": 17.333256,
    "dest_lon": 78.341652,
    "distance_km": 989.067,
    "traffic_delay_minutes": 6.8,
    "speed_kmph": 66.26,
    "traffic_api_score": 6.8,
    "delayed_flag": 0,
    "hour_of_day": 21.0,             # extracted from departure_time
    "day_of_week": 5.0,              # Saturday, extracted from departure_time
    "is_weekend": 1,                 # Saturday = weekend
    "route_type_intra": False,       # since it's "inter"
    "travel_mode_motorcycle": False,
    "travel_mode_truck": False,
    "travel_mode_van": False,
    "road_type_rural": False,
    "road_type_urban": True,         # as per road_type
    "weather_Clouds": False,
    "weather_Haze": False,
    "weather_Mist": False,
    "weather_Rain": False,
    "weather_Smoke": False,
    "weather_Thunderstorm": True 
}

# Convert to JSON
input_json = json.dumps(input_data_for_model)

# POST request
response = requests.post(url, data=input_json, headers={"Content-Type": "application/json"})

# Output
print("Status Code:", response.status_code)
print("Prediction:", response.json())