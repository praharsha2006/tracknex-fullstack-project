# -*- coding: utf-8 -*-
"""
Created on Mon Jun  9 01:24:06 2025

@author: saura
"""

from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import json

app = FastAPI()

class ModelInput(BaseModel):
    source_lat: float = None
    source_lon: float = None
    dest_lat: float = None
    dest_lon: float = None
    distance_km: float = None
    traffic_delay_minutes: float = None
    speed_kmph: float = None
    traffic_api_score: float = None
    delayed_flag: int = None
    hour_of_day: float = None
    day_of_week: float = None
    is_weekend: int = None
    route_type_intra: bool = None
    travel_mode_motorcycle: bool = None
    travel_mode_truck: bool = None
    travel_mode_van: bool = None
    road_type_rural: bool = None
    road_type_urban: bool = None
    weather_Clouds: bool = None
    weather_Haze: bool = None
    weather_Mist: bool = None
    weather_Rain: bool = None
    weather_Smoke: bool = None
    weather_Thunderstorm: bool = None

# Load the saved model
eta_model = pickle.load(open('trained_model.sav', 'rb'))

@app.post('/eta_prediction')
def eta_prediction(input_parameters: ModelInput):

    def fallback(val, default):
        return val if val is not None else default

    input_dict = input_parameters.dict()

    slt = fallback(input_dict.get('source_lat'), 0.0)
    sln = fallback(input_dict.get('source_lon'), 0.0)
    dlt = fallback(input_dict.get('dest_lat'), 0.0)
    dln = fallback(input_dict.get('dest_lon'), 0.0)
    dkm = fallback(input_dict.get('distance_km'), 0.0)
    tdm = fallback(input_dict.get('traffic_delay_minutes'), 0.0)
    skph = fallback(input_dict.get('speed_kmph'), 0.0)
    tas = fallback(input_dict.get('traffic_api_score'), 0.0)
    df = fallback(input_dict.get('delayed_flag'), 0)
    hod = fallback(input_dict.get('hour_of_day'), 12.0)
    dow = fallback(input_dict.get('day_of_week'), 3.0)
    iw = fallback(input_dict.get('is_weekend'), 0)
    rti = fallback(input_dict.get('route_type_intra'), False)
    tmm = fallback(input_dict.get('travel_mode_motorcycle'), False)
    tmt = fallback(input_dict.get('travel_mode_truck'), False)
    tmv = fallback(input_dict.get('travel_mode_van'), False)
    rtr = fallback(input_dict.get('road_type_rural'), False)
    rtu = fallback(input_dict.get('road_type_urban'), False)
    wc = fallback(input_dict.get('weather_Clouds'), False)
    wh = fallback(input_dict.get('weather_Haze'), False)
    wm = fallback(input_dict.get('weather_Mist'), False)
    wr = fallback(input_dict.get('weather_Rain'), False)
    ws = fallback(input_dict.get('weather_Smoke'), False)
    wt = fallback(input_dict.get('weather_Thunderstorm'), False)

    input_list = [
        slt, sln, dlt, dln, dkm, tdm, skph, tas, df, hod, dow, iw,
        rti, tmm, tmt, tmv, rtr, rtu, wc, wh, wm, wr, ws, wt
    ]

    prediction = eta_model.predict([input_list])
    predicted_eta = prediction[0]

    return {"predicted_eta": predicted_eta}