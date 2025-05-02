export function generateTimeSeriesData(sampleData: any, resolution: string, timeCount: number = 60) {
  const _resolution = ['1h', '1m', '1s'].includes(resolution) ? resolution : '1h';
  const timeUnit = _resolution === '1h' ? 3600 : _resolution === '1m' ? 60 : 1; // seconds
  // Create a map to store data points by time key
  const timeMap: any = {};
  
  // Use the provided timeCount (e.g., 12 for hours)
  const boxCount = timeCount > 0 ? timeCount : 60;
  
  if (sampleData.length === 0) {
    // Handle empty data case
    const currentDate = new Date();
    const hour = currentDate.getHours().toString().padStart(2, '0');
    const minute = currentDate.getMinutes().toString().padStart(2, '0');
    
    // Generate empty time slots based on resolution
    for (let i = 0; i < boxCount; i++) {
      let timeKey;
      if (_resolution === '1h') {
        // For hourly resolution, use hour slots
        const hourVal = ((parseInt(hour) + i) % 24).toString().padStart(2, '0');
        timeKey = `${hourVal}:00:00`;
      } else if (_resolution === '1m') {
        // For minute resolution, use minute slots
        const minuteVal = ((parseInt(minute) + i) % 60).toString().padStart(2, '0');
        timeKey = `${hour}:${minuteVal}:00`;
      } else {
        // For second resolution, use second slots
        const secondVal = i.toString().padStart(2, '0');
        timeKey = `${hour}:${minute}:${secondVal}`;
      }
      timeMap[timeKey] = 0;
    }
  } else if (sampleData.length === 1) {
    // Handle single data point case
    const bucketTime = sampleData[0].bucket.split(' ')[1]; 
    const hour = bucketTime.substring(0, 2); 
    const minute = bucketTime.substring(3, 5);
    const second = bucketTime.substring(6, 8);
    
    if (_resolution === '1h') {
      // For hourly resolution, create hour slots
      for (let i = 0; i < boxCount; i++) {
        const hourVal = ((parseInt(hour) + i) % 24).toString().padStart(2, '0');
        const timeKey = `${hourVal}:00:00`;
        timeMap[timeKey] = 0;
      }
      
      // Set the actual data point in the hourly resolution
      const dataTimeKey = `${hour}:00:00`;
      if (timeMap[dataTimeKey] !== undefined) {
        timeMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
      }
    } else if (_resolution === '1m') {
      // For minute resolution, create minute slots
      for (let i = 0; i < boxCount; i++) {
        const minuteVal = ((parseInt(minute) + i) % 60).toString().padStart(2, '0');
        const timeKey = `${hour}:${minuteVal}:00`;
        timeMap[timeKey] = 0;
      }
      
      // Set the actual data point
      const dataTimeKey = `${hour}:${minute}:00`;
      if (timeMap[dataTimeKey] !== undefined) {
        timeMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
      }
    } else {
      // For second resolution
      for (let i = 0; i < boxCount; i++) {
        const secondVal = ((parseInt(second) + i) % 60).toString().padStart(2, '0');
        const timeKey = `${hour}:${minute}:${secondVal}`;
        timeMap[timeKey] = 0;
      }
      
      // Set the actual data point
      const dataTimeKey = `${hour}:${minute}:${second}`;
      if (timeMap[dataTimeKey] !== undefined) {
        timeMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
      }
    }
  } else {
    // Handle multiple data points
    // First, establish the time range based on first data point
    const firstBucket = sampleData[0]?.bucket.split(' ')[1];
    const hour = firstBucket ? firstBucket.substring(0, 2) : '00'; 
    const minute = firstBucket ? firstBucket.substring(3, 5) : '00';
    const second = firstBucket ? firstBucket.substring(6, 8) : '00';
    
    // Create the appropriate time slots based on resolution
    if (_resolution === '1h') {
      // For hourly resolution, create hour slots
      for (let i = 0; i < boxCount; i++) {
        const hourVal = ((parseInt(hour) + i) % 24).toString().padStart(2, '0');
        const timeKey = `${hourVal}:00:00`;
        timeMap[timeKey] = 0;
      }
    } else if (_resolution === '1m') {
      // For minute resolution, create minute slots
      for (let i = 0; i < boxCount; i++) {
        const minuteVal = ((parseInt(minute) + i) % 60).toString().padStart(2, '0');
        const timeKey = `${hour}:${minuteVal}:00`;
        timeMap[timeKey] = 0;
      }
    } else {
      // For second resolution
      for (let i = 0; i < boxCount; i++) {
        const secondVal = ((parseInt(second) + i) % 60).toString().padStart(2, '0');
        const timeKey = `${hour}:${minute}:${secondVal}`;
        timeMap[timeKey] = 0;
      }
    }
    
    // Fill in the actual data points
    sampleData.forEach((item: Record<string, any>) => {
      if (!item.bucket) return;
      
      const bucketTime = item.bucket.split(' ')[1];
      if (!bucketTime) return;
      
      // Determine the appropriate key based on resolution
      let timeKey;
      if (_resolution === '1h') {
        const hour = bucketTime.substring(0, 2);
        timeKey = `${hour}:00:00`;
      } else if (_resolution === '1m') {
        const hour = bucketTime.substring(0, 2);
        const minute = bucketTime.substring(3, 5);
        timeKey = `${hour}:${minute}:00`;
      } else {
        timeKey = bucketTime;
      }
      
      if (timeMap[timeKey] !== undefined) {
        timeMap[timeKey] = item?.bandwidth ? parseInt(item?.bandwidth) : 0;
      }
    });
  }
  
  // Convert map to array and sort by time
  const result = [];
  const sortedKeys = Object.keys(timeMap).sort();
  for (const timeKey of sortedKeys) {
    result.push({
      time: timeKey,
      bandwidth: timeMap[timeKey],
    });
  }
  
  // Ensure we have exactly the requested number of boxes
  if (result.length > boxCount) {
    return result.slice(0, boxCount);
  } else if (result.length < boxCount) {
    // Fill with empty data if needed
    const lastTime = result.length > 0 ? result[result.length - 1].time : '00:00:00';
    const [hour, minute, second] = lastTime.split(':').map(t => parseInt(t));
    
    for (let i = result.length; i < boxCount; i++) {
      // Add additional time slots based on the last time and resolution
      let newHour = hour;
      let newMinute = minute;
      let newSecond = second;
      
      if (_resolution === '1h') {
        newHour = (newHour + 1) % 24;
      } else if (_resolution === '1m') {
        newMinute = (newMinute + 1) % 60;
        if (newMinute === 0) newHour = (newHour + 1) % 24;
      } else {
        newSecond = (newSecond + 1) % 60;
        if (newSecond === 0) {
          newMinute = (newMinute + 1) % 60;
          if (newMinute === 0) newHour = (newHour + 1) % 24;
        }
      }
      
      const timeKey = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}`;
      result.push({
        time: timeKey,
        bandwidth: 0,
      });
    }
  }
  
  return result;
}

// Function to generate nested time series data for hierarchical visualization
export function generateNestedTimeSeriesData(sampleData: any, parentResolution: string, childResolution: string, parentCount: number = 12, childCount: number = 60) {
  // First generate the parent-level time series (e.g., 12 hours)
  const parentTimeSeries = generateTimeSeriesData(sampleData, parentResolution, parentCount);
  
  // For each parent time slot, generate child-level time series (e.g., 60 seconds in each minute)
  return parentTimeSeries.map(parentSlot => {
    const [hour, minute] = parentSlot.time.split(':');
    
    // Filter sample data relevant to this parent time slot
    const relevantSampleData = sampleData.filter((item: Record<string, any>) => {
      if (!item.bucket) return false;
      const bucketTime = item.bucket.split(' ')[1];
      if (!bucketTime) return false;
      
      if (parentResolution === '1h') {
        return bucketTime.startsWith(`${hour}:`);
      } else if (parentResolution === '1m') {
        return bucketTime.startsWith(`${hour}:${minute}`);
      }
      return false;
    });
    
    // Generate child time series for this parent slot
    const childTimeSeries = generateTimeSeriesData(relevantSampleData, childResolution, childCount);
    
    return {
      ...parentSlot,
      children: childTimeSeries
    };
  });
}

