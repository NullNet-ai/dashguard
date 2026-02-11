import L from "leaflet";
import countryList from "~/components/platform/AddressAutoComplete/countryCodes";

export const ORANGE = 'rgba(255, 165, 0, 1)';

const getCountry = (countryName: string): string | null => {
  if (!countryName || typeof countryName !== 'string') return null;
  
  const country = countryList.find(
    (c: any) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return country?.code || null;
};

const getFlagUrl = (
  countryCode: string | null,
  variant: 'h' | 'w' = 'h',
  size: number = 20,
  format: 'png' | 'webp' | 'svg' | 'jpg' = 'png'
): string => {
  if (!countryCode) return '';
  return `https://flagcdn.com/${variant}${size}/${countryCode.toLowerCase()}.${format}`;
};

export const createSourceMarker = (
    mapInstance: any,
    coordinates: any,
    locationName: any,
    trafficLevel: number,
    source_ip: string
  ) => {
  const divIcon = L.divIcon({
    className: 'source-dot',
    html: `<div class="traffic-pulse-marker" style="--pulse-color:${ORANGE}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const marker = L.marker(coordinates, { icon: divIcon }).addTo(mapInstance);

  marker.bindTooltip(
    `<div style="text-align: center;">
      <strong>Source</strong><br/>
      <span style="color: #000;">${source_ip}</span><br/>
      ${locationName} <br />
      ${trafficLevel > 1024 ? (trafficLevel / 1024).toFixed(2) + ' KB' : trafficLevel + ' bytes'} <br/>
    </div>`, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip',
    }
  );

  return marker;
};

export const createDestinationMarker = (
    mapInstance: any, 
    coordinates: any, 
    locationName: any, 
    trafficLevel: any, 
    destination_ip: any
  ) => {
  const divIcon = L.divIcon({
    className: 'destination-dot',
    html: `<div class="traffic-pulse-marker" style="--pulse-color:${ORANGE}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const marker = L.marker(coordinates, { icon: divIcon }).addTo(mapInstance);

  marker.bindTooltip(
    `<div style="text-align: center;">
      <strong>Destination</strong><br/>
      <span style="color: #000;">${destination_ip}</span><br/>
      ${locationName}<br/>
      ${trafficLevel > 1024 ? (trafficLevel / 1024).toFixed(2) + ' KB' : trafficLevel + ' bytes'}<br/>
    </div>`, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip',
    }
  );

  return marker;
};

export const createSourceDestinationMarker = (
    mapInstance: any,
    coordinates: any,
    sourceCountryName: any,
    destinationCountryName: any,
    trafficLevel: number,
    source_ip: string,
    destination_ip?: string
  ) => {
  const divIcon = L.divIcon({
    className: 'source-dot',
    html: `<div class="traffic-pulse-marker" style="--pulse-color:${ORANGE}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const marker = L.marker(coordinates, { icon: divIcon }).addTo(mapInstance);

  const kb = trafficLevel > 1024 ? (trafficLevel / 1024).toFixed(2) + ' KB' : trafficLevel + ' bytes';
  const kbNum = trafficLevel / 1024;
  const intensity = kbNum > 8000 ? 'Heavy' : kbNum > 2000 ? 'Busy' : 'Low';
  const intensityColor = intensity === 'Heavy'
    ? 'rgba(255, 0, 0, 0.7)'
    : intensity === 'Busy'
    ? 'rgba(255, 165, 0, 0.7)'
    : 'rgba(0, 128, 0, 0.7)';


  const sourceCountryCode = getCountry(sourceCountryName);
  const sourceFlagUrl = getFlagUrl(sourceCountryCode, 'h', 20);

  marker.bindTooltip(
    `<div style="display: grid; gap: 6px;">
      <div style="display:flex; align-items:center; gap:8px; padding-bottom: 6px; border-bottom: 1px solid rgb(238, 238, 238)">
        ${sourceFlagUrl ? `<img src="${sourceFlagUrl}" height="12" alt="${sourceCountryName}" style="height: 12px; border: none; display: inline-block; vertical-align: middle;">` : ''}
        <span style="color:${intensityColor};">●</span>
        <span style="font-weight:600;color: #000;">${sourceCountryName}</span>
        <span style="opacity:0.8;">→</span>
        <span style="font-weight:600;color: #000;">${destinationCountryName}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="color: #000;">${source_ip || ''}</span>
        <span style="opacity:0.8;">${destination_ip ? '→' : ''}</span>
        <span style="color: #000;">${destination_ip || ''}</span>
      </div>
      <div><span>Traffic Intensity:</span> <span style="color:${intensityColor}; font-weight:600;">${intensity} (${kb})</span></div>
    </div>`, {
      permanent: false,
      direction: 'top',
      className: 'custom-tooltip',
    }
  );

  return marker;
};
