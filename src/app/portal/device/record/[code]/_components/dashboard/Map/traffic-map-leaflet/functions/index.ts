import { getFlagDetails } from '~/app/api/device/get_flags'

export const additionalCityConnections = async (data: any) => {
  return Promise.all(
    data.flatMap(item => item.result
      .map(async (entry) => {
        const { country } = entry
        const city = entry.city || 'Unknown City'
        const flagDetails = await getFlagDetails(country)
        if (!flagDetails) return null // Exclude if flagDetails is null

        return {
          city: `${city}, ${flagDetails?.name || country}`,
          trafficLevel: Math.floor(Math.random() * 100),
        }
      })
      .filter(Boolean) // Exclude null or undefined values
    )
  )
}

export const regionToRegionConnections = async (data: any) => {
  return Promise.all(
    data.flatMap(item => item.result
      .map(async (entry) => {
        const { country, region } = entry
        if (!region) return null // Exclude if region is null
        const flagDetails = await getFlagDetails(country)
        if (!flagDetails) return null // Exclude if flagDetails is null

        return {
          toRegion: `${region}, ${flagDetails?.name || country}`,
          trafficLevel: Math.floor(Math.random() * 100),
          condition: getRandomCondition(),
        }
      })
      .filter(Boolean) // Exclude null or undefined values
    )
  )
}

export const regionToCityConnections = async (data: any) => {
  return Promise.all(
    data.flatMap(item => item.result
      .map(async (entry) => {
        const { country, region, city } = entry
        if (!region || !city) return null // Exclude if region or city is null
        const flagDetails = await getFlagDetails(country)
        if (!flagDetails) return null // Exclude if flagDetails is null

        return {
          fromRegion: region,
          toCity: `${city}, ${flagDetails?.name || country}`,
          trafficLevel: Math.floor(Math.random() * 100),
          condition: getRandomCondition(),
        }
      })
      .filter(Boolean) // Exclude null or undefined values
    )
  )
}

export const cityToCityConnections = async (data: any) => {
  return Promise.all(
    data.flatMap(item => item.result
      .map(async (entry) => {
        const { country, city } = entry
        if (!city) return null // Exclude if city is null
        const flagDetails = await getFlagDetails(country)
        if (!flagDetails) return null // Exclude if flagDetails is null

        return {
          fromCity: `${city}, ${flagDetails?.name || country}`,
          toCity: getRandomCity(),
          trafficLevel: Math.floor(Math.random() * 100),
          condition: getRandomCondition(),
        }
      })
      .filter(Boolean) // Exclude null or undefined values
    )
  )
}

// Utility function to generate random conditions
function getRandomCondition() {
  const conditions = ['Stable', 'High Latency', 'Low Bandwidth', 'Congested', 'Optimized', 'Normal']
  return conditions[Math.floor(Math.random() * conditions.length)]
}

// Utility function to generate random cities
function getRandomCity() {
  const cities = ['Tokyo, Japan', 'Paris, France', 'Berlin, Germany', 'New York, USA', 'Sydney, Australia']
  return cities[Math.floor(Math.random() * cities.length)]
}
