const axios = require('axios');
const { getWeatherCondition } = require('./weatherTrafficHelper');
const { getTrafficData } = require('./trafficHelper');

async function getPredictedEtaFromApi(pickupCoordinates, deliveryCoordinates) {
    console.log('🛣️ getPredictedEtaFromApi called with:', { pickupCoordinates, deliveryCoordinates });
  try {
    // 🛑 Add early validation
    if (
      !pickupCoordinates || !deliveryCoordinates ||
      typeof pickupCoordinates.lat !== 'number' ||
      typeof pickupCoordinates.lon !== 'number' ||
      typeof deliveryCoordinates.lat !== 'number' ||
      typeof deliveryCoordinates.lon !== 'number'
    ) {
      console.error('❌ Invalid pickup or delivery coordinates:', {
        pickupCoordinates,
        deliveryCoordinates
      });
      return null;
    }

    const weather = await getWeatherCondition(pickupCoordinates.lat, pickupCoordinates.lon);
    const traffic = await getTrafficData(pickupCoordinates, deliveryCoordinates);

    const payload = {
      source_lat: pickupCoordinates.lat,
      source_lon: pickupCoordinates.lon,
      dest_lat: deliveryCoordinates.lat,
      dest_lon: deliveryCoordinates.lon,
      distance_km: traffic?.distance_km ?? 12.0,
      traffic_delay_minutes: traffic?.traffic_delay_minutes ?? 5.0,
      speed_kmph: 40.0,
      traffic_api_score: 3.5,
      delayed_flag: traffic?.traffic_delay_minutes > 10 ? 1 : 0,
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
      route_type_intra: true,
      travel_mode_motorcycle: false,
      travel_mode_truck: false,
      travel_mode_van: true,
      road_type_rural: false,
      road_type_urban: true,
      weather_Clouds: weather === 'Clouds',
      weather_Haze: weather === 'Haze',
      weather_Mist: weather === 'Mist',
      weather_Rain: weather === 'Rain',
      weather_Smoke: weather === 'Smoke',
      weather_Thunderstorm: weather === 'Thunderstorm'
    };

    const response = await axios.post(
      'https://delivery-tracking-2xva.onrender.com/eta_prediction',
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    if (!response.data || response.data.predicted_eta === undefined) {
      console.warn('⚠️ ML API returned unexpected response format:', response.data);
      return null;
    }

    return response.data.predicted_eta;

  } catch (error) {
    console.error('❌ ETA prediction API call failed');
    console.error('➡️ Reason:', error.message);
    return null;
  }
}

module.exports = { getPredictedEtaFromApi };
