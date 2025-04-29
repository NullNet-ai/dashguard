import axios from 'axios'

export async function getFlagDetails(country: string) {
  if (!country || typeof country !== 'string' || country.length < 2) {
    console.error('Invalid country code:', country)
    return { flag: '/unknown-flag.svg', name: 'No IP Info', country: 'No IP Info' }
  }

  try {
    const data = await axios.get(`https://restcountries.com/v3.1/alpha/${country}`)
    return { flag: data?.data?.[0]?.flags?.svg, name: data?.data?.[0]?.name?.common, country }
  }
  catch (error) {
    console.error(`Failed to fetch flag details for country: ${country}`, error)
    return { flag: null, name: null, country }
  }
}
