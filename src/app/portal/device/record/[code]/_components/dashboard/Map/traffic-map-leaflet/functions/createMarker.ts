import L from "leaflet";

export const ORANGE = 'rgba(255, 165, 0, 1)';

export const createSourceMarker = (
    mapInstance: any,
    coordinates: any,
    locationName: any,
    trafficLevel: number,
    source_ip: string
  ) => {
  const divIcon = L.divIcon({
    className: 'source-dot',
    html: `<div class="dot" style="background:${ORANGE}; width:16px; height:16px;"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
    html: `<div class="dot" style="background:${ORANGE}; width:16px; height:16px;"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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