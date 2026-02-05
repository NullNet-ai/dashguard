export function generateTimeSeriesDataForLiveData(
  sampleData: any,
  prevSeries?: Array<{ time: string; bandwidth: number; bucketTime: string }>
) {
  function formatDate(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  // Find the latest minute and latest second in the sampleData
  let latestMinuteDate = new Date(0);
  if (sampleData.length > 0) {
    latestMinuteDate = sampleData.reduce((latest: Date, item: any) => {
      const d = new Date(item.bucket);
      return d > latest ? d : latest;
    }, new Date(sampleData[0].bucket));
  }
  const latestHour = latestMinuteDate.getHours();
  const latestMinute = latestMinuteDate.getMinutes();
  const latestSecond = latestMinuteDate.getSeconds();

  // Build a lookup for bandwidth by second for the latest minute
  const dataBySecond: Record<string, number> = {};
  sampleData.forEach((item: Record<string, any>) => {
    const d = new Date(item.bucket);
    if (d.getHours() === latestHour && d.getMinutes() === latestMinute) {
      const secondKey = d.getSeconds().toString().padStart(2, '0');
      dataBySecond[secondKey] = item?.bandwidth ? parseInt(item.bandwidth) : 0;
    }
  });

  // Progressive sweep: only update up to the latestSecond in the new minute
  const output = Array.from({ length: 60 }, (_, i) => {
    const secondKey = i.toString().padStart(2, '0');
    const bucketTime = new Date(latestMinuteDate);
    bucketTime.setSeconds(i);
    const formattedBucketTime = formatDate(bucketTime);

    if (i <= latestSecond) {
      // For swept range, use new data or 0, and update time to latest minute
      return {
        time: secondKey,
        bandwidth: dataBySecond[secondKey] !== undefined ? dataBySecond[secondKey] : 0,
        bucketTime: formattedBucketTime,
      };
    } else if (prevSeries && prevSeries[i]) {
      // For the rest, keep previous value (even if from old minute)
      return prevSeries[i];
    } else {
      // Or initialize to 0 for the latest minute
      return {
        time: secondKey,
        bandwidth: 0,
        bucketTime: formattedBucketTime,
      };
    }
  });

  return output;
}

export function generateTimeSeriesData(
  sampleData: any,
  resolution: string,
  time_count: number,
  time_unit: string
) {
  // Parse resolution
  const resolution_value = parseInt(resolution.slice(0, -1));
  const resolution_unit = resolution.slice(-1);

  if (isNaN(resolution_value) || !['h', 'm', 's'].includes(resolution_unit)) {
    throw new Error('Invalid resolution format. Expected format: <number><unit> (e.g., 4h, 30m, 1s)');
  }

  // Determine interval in ms
  let intervalMs = 0;
  if (resolution_unit === 'h') intervalMs = resolution_value * 60 * 60 * 1000;
  else if (resolution_unit === 'm') intervalMs = resolution_value * 60 * 1000;
  else if (resolution_unit === 's') intervalMs = resolution_value * 1000;

  // Determine total time span in ms
  let totalSpanMs = 0;
  if (time_unit === 'day') totalSpanMs = time_count * 24 * 60 * 60 * 1000;
  else if (time_unit === 'hour') totalSpanMs = time_count * 60 * 60 * 1000;
  else if (time_unit === 'minute') totalSpanMs = time_count * 60 * 1000;

  // Find the reference date
  let refDate = sampleData.length > 0 ? new Date(sampleData[0].bucket.replace(' ', 'T')) : new Date();
  sampleData.forEach((item: any) => {
    const d = new Date(item.bucket.replace(' ', 'T'));
    if (d < refDate) refDate = d;
  });

  let startDate = new Date(refDate);
  // startDate.setMinutes(0, 0, 0); // Align to the top of the current hour (e.g., 8:14 PM -> 8:00 PM)
  if (resolution_unit === 'h') {
    startDate.setHours(0, 0, 0, 0); // Start from 00:00:00 if hourly
  } else {
    // For minutes/seconds, start from the time of the earliest sample
    startDate = new Date(refDate);
  }

  // Build a map for fast lookup
  const bucketMap: Record<string, any> = {};
  sampleData.forEach((item: any) => {
    bucketMap[item.bucket] = item.bandwidth;
  });

  // Calculate number of intervals (inclusive)
  const intervals = 60 // Math.floor(totalSpanMs / intervalMs);

  // Generate the full range of time intervals
  const now = new Date()
  const endDate = new Date(now)
  if (resolution_unit === 's') {
    const needsAdvance = endDate.getMilliseconds() !== 0
    endDate.setMilliseconds(0)
    const currentSeconds = endDate.getSeconds()
    const remainder = currentSeconds % resolution_value
    if (remainder !== 0) {
      endDate.setSeconds(currentSeconds + (resolution_value - remainder))
    } else if (needsAdvance) {
      endDate.setSeconds(currentSeconds + resolution_value)
    }
  } else if (resolution_unit === 'm') {
    const needsAdvance = endDate.getSeconds() !== 0 || endDate.getMilliseconds() !== 0
    endDate.setSeconds(0, 0)
    const currentMinutes = endDate.getMinutes()
    const remainder = currentMinutes % resolution_value
    if (remainder !== 0) {
      endDate.setMinutes(currentMinutes + (resolution_value - remainder))
    } else if (needsAdvance) {
      endDate.setMinutes(currentMinutes + resolution_value)
    }
  } else if (resolution_unit === 'h') {
    const needsAdvance =
      endDate.getMinutes() !== 0 || endDate.getSeconds() !== 0 || endDate.getMilliseconds() !== 0
    endDate.setMinutes(0, 0, 0)
    const currentHours = endDate.getHours()
    const remainder = currentHours % resolution_value
    if (remainder !== 0) {
      endDate.setHours(currentHours + (resolution_value - remainder))
    } else if (needsAdvance) {
      endDate.setHours(currentHours + resolution_value)
    }
  }

  let currentDate = new Date(endDate.getTime() - intervals * intervalMs)
  let timeSeriesArray: { time: string, bandwidth: string }[] = [];

  for (let i = 0; i <= intervals; i++) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate =
      currentDate.getFullYear() + '-' +
      pad(currentDate.getMonth() + 1) + '-' +
      pad(currentDate.getDate()) + ' ' +
      pad(currentDate.getHours()) + ':' +
      pad(currentDate.getMinutes()) + ':' +
      pad(currentDate.getSeconds());
    timeSeriesArray.push({ 
      time: formattedDate,
      bandwidth: bucketMap[formattedDate] !== undefined ? bucketMap[formattedDate] : "0"
    });

    currentDate = new Date(currentDate.getTime() + intervalMs);
  }

  if (time_unit === 'hour') {
    return timeSeriesArray.slice(-26)
  } 
  return timeSeriesArray;
}