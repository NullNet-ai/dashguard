import axios from 'axios'

export async function getFlagDetails(country: string) {
  const data = await axios.get(`https://restcountries.com/v3.1/alpha/${country}`)

  return { flag: data?.data?.[0]?.flags?.svg, name: data?.data?.[0]?.name?.common, country }
}
