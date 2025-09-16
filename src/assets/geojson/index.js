// GeoJSON data exports for easy importing
import unisanBarangaysData from './unisan_quezon_36_barangays.geojson?url';

export { unisanBarangaysData };

// Alternative: If you want to load the GeoJSON as JSON object
export const loadUnisanBarangays = async () => {
  try {
    const response = await fetch(unisanBarangaysData);
    const geojsonData = await response.json();
    return geojsonData;
  } catch (error) {
    console.error('Failed to load Unisan barangays GeoJSON:', error);
    return null;
  }
};