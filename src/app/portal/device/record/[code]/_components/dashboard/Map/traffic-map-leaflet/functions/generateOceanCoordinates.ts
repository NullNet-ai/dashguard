export  const generateOceanCoordinates = () => {
    // Define major ocean regions (approximate)
    const oceanRegions = [
      // Pacific Ocean
      { lat: [-50, 40], lng: [-170, -120] },
      { lat: [-50, 40], lng: [150, 180] },
      // Atlantic Ocean
      { lat: [-40, 50], lng: [-60, -20] },
      // Indian Ocean
      { lat: [-40, 20], lng: [60, 100] },
      // Southern Ocean
      { lat: [-65, -50], lng: [-180, 180] },
      // Arctic Ocean
      { lat: [75, 85], lng: [-180, 180] },
    ];

    // Select a random ocean region
    const region: any = oceanRegions[Math.floor(Math.random() * oceanRegions.length)];
    
    // Generate random coordinates within the selected region
    const lat = region.lat[0] + Math.random() * (region.lat[1] - region.lat[0]);
    const lng = region.lng[0] + Math.random() * (region.lng[1] - region.lng[0]);
    
    return [lat, lng];
  };