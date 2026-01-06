/**
 * ========================================
 * GEOLOCATION HELPER
 * ========================================
 * Helper untuk validasi GPS dan geo-fencing
 * Menggunakan Haversine formula untuk hitung jarak
 */

/**
 * Haversine Formula
 * Menghitung jarak antara 2 titik GPS di permukaan bumi
 * 
 * @param {number} lat1 - Latitude titik 1
 * @param {number} lon1 - Longitude titik 1
 * @param {number} lat2 - Latitude titik 2
 * @param {number} lon2 - Longitude titik 2
 * @returns {number} Jarak dalam meter
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Radius bumi dalam meter
  const R = 6371000;

  // Convert degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Validasi apakah koordinat GPS valid
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
function isValidGPSCoordinates(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }

  // Latitude: -90 to 90
  // Longitude: -180 to 180
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Cari lokasi kantor terdekat dari koordinat user
 * 
 * @param {number} userLat - Latitude user
 * @param {number} userLon - Longitude user
 * @param {Array} officeLocations - Array of office locations
 * @returns {Object|null} { location, distance } atau null jika tidak ada
 */
function findNearestOffice(userLat, userLon, officeLocations) {
  if (!officeLocations || officeLocations.length === 0) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  for (const office of officeLocations) {
    const distance = calculateDistance(
      userLat,
      userLon,
      parseFloat(office.latitude),
      parseFloat(office.longitude)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        location: office,
        distance: distance
      };
    }
  }

  return nearest;
}

/**
 * Validasi apakah user dalam radius lokasi kantor
 * 
 * @param {number} userLat - Latitude user
 * @param {number} userLon - Longitude user
 * @param {Object} officeLocation - Office location object
 * @returns {Object} { isValid, distance, status, message }
 */
function validateLocationRadius(userLat, userLon, officeLocation) {
  // Validasi koordinat
  if (!isValidGPSCoordinates(userLat, userLon)) {
    return {
      isValid: false,
      distance: null,
      status: 'gps_error',
      message: 'Koordinat GPS tidak valid'
    };
  }

  // Hitung jarak
  const distance = calculateDistance(
    userLat,
    userLon,
    parseFloat(officeLocation.latitude),
    parseFloat(officeLocation.longitude)
  );

  const radius = officeLocation.radius || 50; // Default 50 meter

  // Cek apakah dalam radius
  const isWithinRadius = distance <= radius;

  return {
    isValid: isWithinRadius,
    distance: distance,
    status: isWithinRadius ? 'valid' : 'outside_radius',
    message: isWithinRadius
      ? `Anda berada dalam radius ${radius}m dari ${officeLocation.name}`
      : `Anda berada ${Math.round(distance)}m dari ${officeLocation.name} (radius maksimal: ${radius}m)`,
    officeLocation: officeLocation
  };
}

/**
 * Validasi geo-fencing untuk attendance
 * Support multiple office locations
 * 
 * @param {number} userLat 
 * @param {number} userLon 
 * @param {Array} officeLocations - Array of active office locations
 * @returns {Object} Hasil validasi lengkap
 */
function validateAttendanceLocation(userLat, userLon, officeLocations) {
  // Validasi koordinat user
  if (!isValidGPSCoordinates(userLat, userLon)) {
    return {
      isValid: false,
      status: 'gps_error',
      message: 'Koordinat GPS tidak valid atau tidak tersedia',
      nearestOffice: null,
      distance: null
    };
  }

  // Jika tidak ada office locations (semua WFH?)
  if (!officeLocations || officeLocations.length === 0) {
    return {
      isValid: true,
      status: 'not_checked',
      message: 'Tidak ada lokasi kantor yang dikonfigurasi',
      nearestOffice: null,
      distance: null
    };
  }

  // Cari kantor terdekat
  const nearestOffice = findNearestOffice(userLat, userLon, officeLocations);

  if (!nearestOffice) {
    return {
      isValid: false,
      status: 'gps_error',
      message: 'Gagal menghitung jarak ke kantor',
      nearestOffice: null,
      distance: null
    };
  }

  // Validasi radius di kantor terdekat
  const validation = validateLocationRadius(
    userLat,
    userLon,
    nearestOffice.location
  );

  return {
    isValid: validation.isValid,
    status: validation.status,
    message: validation.message,
    nearestOffice: nearestOffice.location,
    distance: nearestOffice.distance,
    officeLocationId: nearestOffice.location.id
  };
}

/**
 * Format koordinat GPS untuk display
 * 
 * @param {number} lat 
 * @param {number} lon 
 * @returns {string}
 */
function formatGPSCoordinates(lat, lon) {
  if (!isValidGPSCoordinates(lat, lon)) {
    return 'Koordinat tidak valid';
  }

  const latDirection = lat >= 0 ? 'N' : 'S';
  const lonDirection = lon >= 0 ? 'E' : 'W';

  return `${Math.abs(lat).toFixed(6)}°${latDirection}, ${Math.abs(lon).toFixed(6)}°${lonDirection}`;
}

/**
 * Generate Google Maps link dari koordinat
 * 
 * @param {number} lat 
 * @param {number} lon 
 * @returns {string}
 */
function generateMapsLink(lat, lon) {
  if (!isValidGPSCoordinates(lat, lon)) {
    return null;
  }

  return `https://www.google.com/maps?q=${lat},${lon}`;
}

module.exports = {
  calculateDistance,
  isValidGPSCoordinates,
  findNearestOffice,
  validateLocationRadius,
  validateAttendanceLocation,
  formatGPSCoordinates,
  generateMapsLink
};
