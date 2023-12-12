const axios = require('axios');

async function reverseGeocodeWithOpenStreetMap(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

module.exports = reverseGeocodeWithOpenStreetMap;