export const geocodeAddress = async (address: string): Promise<number[] | null> => {
  if (address === "No IP Info") return null;

  // Primary: Photon by Komoot (free, no API key, OSM-based, higher rate limits)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
    const photonResponse = await fetch(photonUrl);
    if (photonResponse.ok) {
      const photonData = await photonResponse.json();
      if (photonData?.features?.length > 0) {
        const [lon, lat] = photonData.features[0].geometry.coordinates;
        return [lat, lon];
      }
    }
  } catch {
    // fall through to Nominatim
  }

  // Fallback: Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
    const nominatimResponse = await fetch(nominatimUrl);
    if (nominatimResponse.ok) {
      const nominatimData = await nominatimResponse.json();
      if (nominatimData?.length > 0) {
        return [parseFloat(nominatimData[0].lat), parseFloat(nominatimData[0].lon)];
      }
    }
    console.error(`Address "${address}" not found.`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
