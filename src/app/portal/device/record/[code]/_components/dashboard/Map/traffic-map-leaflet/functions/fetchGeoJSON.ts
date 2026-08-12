export const fetchGeoJSON = async (countriesGeoJSON: Record<string, any>) => {
    try {
      const response = await fetch('/countries_with_geo.json');
      const response1 = await fetch('/countries_with_no_geo.json');
      let data = await response.json();
      let data1 = await response1.json();
      data = {
        ...data,
        features: [
          ...data.features,
          ...data1
        ]
      }
      countriesGeoJSON.current = data; // Store the GeoJSON data for later use
      return data;
    } catch (error) {
      console.error('Error fetching country borders:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  };