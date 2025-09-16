/**
 * Location utility functions for UERRA
 * Handles various location data formats from the database
 */

/**
 * Parse location data from various formats
 * @param {string|object} location - Location data from database
 * @returns {[number, number]|null} - [longitude, latitude] or null if invalid
 */
export const parseLocation = (location) => {
  if (!location) return null;
  
  // Handle PostGIS POINT geometry format: "POINT(lng lat)"
  if (typeof location === 'string') {
    try {
      // Try parsing as PostGIS POINT format from ST_AsText
      const pointMatch = location.match(/POINT\(([^)]+)\)/);
      if (pointMatch) {
        const [lng, lat] = pointMatch[1].split(' ').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lng, lat];
        }
      }
      
      // Try parsing as JSON object string
      const obj = JSON.parse(location);
      if (obj.lat && obj.lng) {
        return [obj.lng, obj.lat]; // Return as [lng, lat] for Mapbox
      }
      if (obj.latitude && obj.longitude) {
        return [obj.longitude, obj.latitude];
      }
      
      // Try parsing as comma-separated string "lat,lng"
      const coords = location.split(',').map(s => parseFloat(s.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return [coords[1], coords[0]]; // Assuming "lat,lng" format, return as [lng, lat]
      }
    } catch (e) {
      console.error('Error parsing location string:', e);
    }
  } 
  // Handle object format (including PostGIS coordinates)
  else if (typeof location === 'object') {
    if (location.lat && location.lng) {
      return [location.lng, location.lat];
    }
    if (location.latitude && location.longitude) {
      return [location.longitude, location.latitude];
    }
    // Handle PostGIS geometry object with coordinates array
    if (location.coordinates && Array.isArray(location.coordinates)) {
      const [lng, lat] = location.coordinates;
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lng, lat];
      }
    }
    // Handle direct lng/lat properties
    if (location.lng !== undefined && location.lat !== undefined) {
      return [location.lng, location.lat];
    }
  }
  
  return null;
};

/**
 * Validate if coordinates are within Philippines bounds
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {boolean} - True if within Philippines
 */
export const isValidPhilippinesLocation = (lng, lat) => {
  // Philippines bounds
  return lat >= 4.0 && lat <= 21.0 && lng >= 116.0 && lng <= 127.0;
};

/**
 * Validate if coordinates are within Unisan bounds (approximate)
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {boolean} - True if within Unisan area
 */
export const isValidUnisanLocation = (lng, lat) => {
  // Unisan municipality approximate bounds
  return lat >= 13.80 && lat <= 13.93 && lng >= 121.93 && lng <= 122.06;
};

/**
 * Format coordinates for display
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {string} - Formatted coordinate string
 */
export const formatCoordinates = (lng, lat) => {
  if (isNaN(lng) || isNaN(lat)) return 'Invalid coordinates';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Convert location to PostGIS POINT format
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {string} - PostGIS POINT string
 */
export const toPostGISPoint = (lng, lat) => {
  if (isNaN(lng) || isNaN(lat)) return null;
  return `POINT(${lng} ${lat})`;
};