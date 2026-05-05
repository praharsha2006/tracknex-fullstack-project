const axios = require('axios');
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

async function getWeatherCondition(lat, lon) {
  if (!OPENWEATHER_API_KEY) {
    console.error('❌ OPENWEATHER_API_KEY is missing from environment variables');
    return null;
  }

  try {
    console.log(`📍 Fetching weather for coordinates: lat=${lat}, lon=${lon}`);

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    console.log(`🌐 Weather API URL: ${url}`);

    const res = await axios.get(url, { timeout: 5000 });

    if (
      res.data &&
      Array.isArray(res.data.weather) &&
      res.data.weather.length > 0 &&
      res.data.weather[0].main
    ) {
      const condition = res.data.weather[0].main;
      console.log(`✅ Weather condition received: ${condition}`);
      return condition; // Example: Rain, Clouds, etc.
    } else {
      console.warn('⚠️ Unexpected weather API response format:', res.data);
      return null;
    }
  } catch (err) {
    if (err.response) {
      console.error('❌ Weather API error response:', err.response.data);
    } else {
      console.error('❌ Weather API error:', err.message);
    }
    return null;
  }
}

module.exports = { getWeatherCondition };
