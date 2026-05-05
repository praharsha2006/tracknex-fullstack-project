const axios = require('axios');
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

async function getTrafficData(pickup, delivery) {
  try {
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${pickup.lat},${pickup.lon}:${delivery.lat},${delivery.lon}/json?key=${TOMTOM_API_KEY}&traffic=true&computeTravelTimeFor=all`;

    const response = await axios.get(url, { timeout: 8000 });
    const summary = response.data.routes[0].summary;

    return {
      distance_km: summary.lengthInMeters / 1000,
      traffic_delay_minutes: summary.trafficDelayInSeconds / 60,
      travel_time_minutes: summary.travelTimeInSeconds / 60,
    };
  } catch (err) {
    console.error('TomTom Traffic Error:', err.message);
    return null;
  }
}

module.exports = { getTrafficData };
