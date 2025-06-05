import { getFlagDetails } from '~/app/api/device/get_flags'

export const additionalCityConnections = async (data: any) => {
  return Promise.all(
    data.map((item: Record<string, any>) => {
      const { country, city, name, destination_ip } = item ?? {}
      return {
        city: `${city}, ${name || country}`,
        trafficLevel: Math.floor(Math.random() * 100),
        destination_ip,

      }
    })
      .filter(Boolean)
  )
}

export const regionToRegionConnections = async (data: any) => {
  return Promise.all(
    data.map(async (item: Record<string, any>) => {
      const { region, country, name, destination_ip } = item ?? {}
      if (!region) return null
      const flagDetails = await getFlagDetails(country)
      if (!flagDetails) return null

      return {
        toRegion: `${region}, ${name || country}`,
        trafficLevel: Math.floor(Math.random() * 100),
        destination_ip,
        condition: getRandomCondition(),
      }
    })
      .filter(Boolean)
  )
}

export const regionToCityConnections = async (data: any) => {
  return Promise.all(
    data.map(async (item: Record<string, any>) => {
      const { destination_ip, region, country, name, city } = item ?? {}
      if (!region || !city) return null
      const flagDetails = await getFlagDetails(country)
      if (!flagDetails) return null

      return {
        fromRegion: region,
        toCity: `${city}, ${name || country}`,
        trafficLevel: Math.floor(Math.random() * 100),
        destination_ip,
        condition: getRandomCondition(),
      }
    })
      .filter(Boolean)
  )
}

export const cityToCityConnections = async (data: any) => {
  return Promise.all(
    data.flatMap(async (item: Record<string, any>) => {
      const { destination_ip, name, country, city } = item ?? {}
      if (!city) return null
      const flagDetails = await getFlagDetails(country)
      if (!flagDetails) return null

      return {
        fromCity: `${city}, ${name || country}`,
        toCity: getRandomCity(),
        trafficLevel: Math.floor(Math.random() * 100),
        destination_ip,
        condition: getRandomCondition(),
      }
    })
      .filter(Boolean)
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
