export const geocodeAddress = async (address: string) => {
  // Don't try to geocode "No IP Info"
  if (address === "No IP Info") return null;
  
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
    else {
      console.error(`Address "${address}" not found.`)
      return null
    }
  }
  catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
