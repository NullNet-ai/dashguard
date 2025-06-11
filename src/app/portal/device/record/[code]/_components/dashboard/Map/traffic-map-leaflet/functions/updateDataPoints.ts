
  export const updateDataPoints = (prevData = [], newData: Record<string, any>, removedIpCache: Record<string, any>) => {
    const updatedData: Record<string, any> = [...prevData];
  
    // Check if the new data point already exists
    const existingIndex = updatedData.findIndex(
      (item: Record<string, any>) =>
        item?.source_ip === newData?.source_ip &&
        item?.destination_ip === newData?.destination_ip
    );
  
    if (existingIndex !== -1) {
      // If it exists, update the existing data point
      updatedData[existingIndex] = {
        ...updatedData[existingIndex],
        ...newData, // Update traffic level or other properties
      };
    } else {
      // If it doesn't exist, add the new data point
      if (updatedData.length >= 10) {
        // Remove the last point if we already have 10 points
        const removedPoint = updatedData.pop();
  
        // Cache the removed IPs if they don't have country information
        if (removedPoint) {
          if (!removedPoint.source_country || !removedPoint.destination_country) {
            removedIpCache.current[removedPoint.source_ip] = removedPoint.sourceCoordinates;
            removedIpCache.current[removedPoint.destination_ip] = removedPoint.destinationCoordinates;
          }
        }
      }
  
      // Check if the new IPs exist in the cache and reuse their coordinates
      if (!newData.source_country && removedIpCache.current[newData.source_ip]) {
        newData.sourceCoordinates = removedIpCache.current[newData.source_ip];
      }
      if (!newData.destination_country && removedIpCache.current[newData.destination_ip]) {
        newData.destinationCoordinates = removedIpCache.current[newData.destination_ip];
      }
  
      // Add the new data point at the beginning
      updatedData.unshift(newData);
    }
  
    return updatedData;
  };