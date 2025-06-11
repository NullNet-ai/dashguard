export const fetchGeoJSON = async (countriesGeoJSON: Record<string, any>) => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
      const data = await response.json();
      countriesGeoJSON.current = data; // Store the GeoJSON data for later use
      return data;
    } catch (error) {
      console.error('Error fetching country borders:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  };