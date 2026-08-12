import flagsData from '../../../../public/flags.json'

interface IFlagEntry {
  flags: { png: string; svg: string; alt?: string }
  name: { common: string; official: string }
}

export function getFlagDetails(country: string) {
  if (!country || typeof country !== 'string') {
    return { flag: '/unknown-flag.svg', name: 'No IP Info', country: 'No IP Info' }
  }

  const countryLower = country.toLowerCase()
  const match = (flagsData as IFlagEntry[]).find(entry => {
    const code = entry.flags?.svg?.split('/').pop()?.replace('.svg', '') ?? ''
    return code === countryLower
  })

  if (!match) {
    return { flag: null, name: null, country }
  }

  return { flag: match.flags?.svg, name: match.name?.common, country }
}
