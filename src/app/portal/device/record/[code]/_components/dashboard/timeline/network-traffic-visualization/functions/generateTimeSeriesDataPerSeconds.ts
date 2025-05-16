export function generateTimeSeriesDataForLiveData(sampleData: any, resolution: string, time_count: number, time_unit: string) {

  const timeMap: any = {};

  if (sampleData.length === 1) {
    const bucketTime = sampleData[0].bucket.split(' ')[1];
    const hour = bucketTime.substring(0, 2);
    const minute = bucketTime.substring(3, 5);

    let timePoints = 0;
    const unit = resolution.slice(-1); // Get the last character (unit: 's', 'm', or 'h')

    switch (unit) {
      case 's': // Seconds
        timePoints = 60;
        for (let i = 0; i < timePoints; i++) {
          const seconds = i.toString().padStart(2, '0');
          const timeKey = `${hour}:${minute}:${seconds}`;
          timeMap[timeKey] = 0;
        }
        break;

      case 'm': // Minutes
        timePoints = 60;
        for (let i = 0; i < timePoints; i++) {
          const minutes = i.toString().padStart(2, '0');
          const timeKey = `${hour}:${minutes}:00`;
          timeMap[timeKey] = 0;
        }
        break;

      case 'h': // Hours
        timePoints = 24;
        for (let i = 0; i < timePoints; i++) {
          const hours = i.toString().padStart(2, '0');
          const timeKey = `${hours}:00:00`;
          timeMap[timeKey] = 0;
        }
        break;

      default:
        console.error("Invalid resolution unit");
        return [];
    }

    const second = bucketTime.substring(6, 8);
    const dataTimeKey =
      unit === 's'
        ? `${hour}:${minute}:${second}`
        : unit === 'm'
        ? `${hour}:${minute}:00`
        : `${hour}:00:00`;

    timeMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
  } else {
    const firstBucket = sampleData[0]?.bucket.split(' ')[1];
    const hour = firstBucket ? firstBucket.substring(0, 2) : '00';
    const minute = firstBucket ? firstBucket.substring(3, 5) : '00';

    let timePoints = 0;
    const unit = resolution.slice(-1);

    if(unit === 's') {
      timePoints = 60;
      for (let i = 0; i < timePoints; i++) {
        const seconds = i.toString().padStart(2, '0');
        const timeKey = `${hour}:${minute}:${seconds}`;
        timeMap[timeKey] = 0;
      }
    }

    sampleData.forEach((item: Record<string, any>) => {
      const bucketTime = item.bucket.split(' ')[1];
      const dataTimeKey =
        unit === 's'
          ? bucketTime
          : unit === 'm'
          ? `${bucketTime.substring(0, 5)}:00`
          : `${bucketTime.substring(0, 2)}:00:00`;

      if (timeMap[dataTimeKey] !== undefined) {
        timeMap[dataTimeKey] = item?.bandwidth ? parseInt(item?.bandwidth) : 0;
      }
    });
  }

  // Convert timeMap to an array
  const timeSeriesArray = Object.keys(timeMap).map((timeKey) => ({
    time: timeKey,
    bandwidth: timeMap[timeKey],
  }));

  return timeSeriesArray;
}


export function generateTimeSeriesData(sampleData: any, resolution: string, time_count: number, time_unit: string) {
  const timeMap: any = {};

  const resolution_value = parseInt(resolution.slice(0, -1)); // Extract the numeric value of the resolution
  const resolution_unit = resolution.slice(-1); // Extract the unit ('h', 'm', 's')

  if (isNaN(resolution_value) || !['h', 'm', 's'].includes(resolution_unit)) {
    throw new Error('Invalid resolution format. Expected format: <number><unit> (e.g., 4h, 30m, 1s)');
  }

  // Calculate total intervals dynamically based on time_unit and resolution
  let totalIntervals = (() => {
    if (time_unit === 'day') {
      return (24 * 60 * 60) / resolution_value; // Total seconds in a day divided by resolution
    } else if (time_unit === 'hour') {
      return (60 * 60) / resolution_value; // Total seconds in an hour divided by resolution
    } else if (time_unit === 'minute') {
      return 60 / resolution_value; // Total seconds in a minute divided by resolution
    }
    return 1; // Default fallback
  })();

  // Special case: Limit to 60 time points if time_count = 1, time_unit = day, and resolution = 1s
  if (time_count === 1 && time_unit === 'day' && resolution_unit === 's') {
    totalIntervals = 60; // Limit to 60 time points
  }

  // Start from the most recent time in sampleData or the current date
  let currentDate = sampleData.length > 0
    ? new Date(sampleData[0].bucket) // Use the first bucket time if sampleData exists
    : new Date(); // Otherwise, use the current time
  currentDate.setSeconds(0, 0); // Reset seconds and milliseconds to 0

  // Generate the full range of time intervals
  for (let i = 0; i < totalIntervals; i++) {
    const formattedDate = currentDate.toISOString().replace('T', ' ').slice(0, 19); // Format as YYYY-MM-DD HH:mm:ss
    timeMap[formattedDate] = 0; // Initialize with 0 bandwidth

    // Decrement the time by the resolution
    if (resolution_unit === 's') {
      currentDate.setSeconds(currentDate.getSeconds() - resolution_value);
    } else if (resolution_unit === 'm') {
      currentDate.setMinutes(currentDate.getMinutes() - resolution_value);
    } else if (resolution_unit === 'h') {
      currentDate.setHours(currentDate.getHours() - resolution_value);
    }
  }

  // Fill in the sample data into the timeMap
  sampleData.forEach((item: Record<string, any>) => {
    const bucketTime = item.bucket; // Use bucket time directly as it is already in UTC
    if (timeMap[bucketTime] !== undefined) {
      timeMap[bucketTime] = item?.bandwidth ? parseInt(item?.bandwidth, 10) : 0;
    }
  });

  // Convert timeMap to an array
  const timeSeriesArray = Object.keys(timeMap)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Sort by time
    .map((timeKey) => ({
      time: timeKey,
      bandwidth: timeMap[timeKey],
    }));

  return timeSeriesArray;
}