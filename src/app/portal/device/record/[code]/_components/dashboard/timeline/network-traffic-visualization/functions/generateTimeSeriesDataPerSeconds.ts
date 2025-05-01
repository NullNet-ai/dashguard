function generateTimeSeriesData(sampleData: any, resolution: string) {
  const _resolution = ['1h', '1m', '1s'].includes(resolution) ? resolution : '1h';
  const timeUnit = _resolution === '1h' ? 3600 : _resolution === '1m' ? 60 : 1; // seconds
  const secondMap: any = {};

  if (sampleData.length === 1) {
    const bucketTime = sampleData[0].bucket.split(' ')[1]; 
    const hour = bucketTime.substring(0, 2); 
    const minute = bucketTime.substring(3, 5); 

    for (let i = 0; i < 60; i++) {
      const seconds = i.toString().padStart(2, '0');
      const timeKey = `${hour}:${minute}:${seconds}`;
      secondMap[timeKey] = 0;
    }

    const second = bucketTime.substring(6, 8);
    const dataTimeKey = `${hour}:${minute}:${second}`;
    secondMap[dataTimeKey] = sampleData[0]?.bandwidth ? parseInt(sampleData[0].bandwidth) : 0;
  } else {
    const firstBucket = sampleData[0]?.bucket.split(' ')[1];
    const hour = firstBucket ? firstBucket.substring(0, 2) : '00'; 
    const minute = firstBucket ? firstBucket.substring(3, 5) : '00'; 
    for (let i = 0; i < 60; i++) {
      const seconds = i.toString().padStart(2, '0'); 
      const timeKey = `${hour}:${minute}:${seconds}`;
      secondMap[timeKey] = 0;
    }

    sampleData.forEach((item: Record<string, any>) => {
      const bucketTime = item.bucket.split(' ')[1]; 
      const timeKey = bucketTime; 
      if (secondMap[timeKey] !== undefined) {
        secondMap[timeKey] = item?.bandwidth ? parseInt(item?.bandwidth) : 0;
      }
    });
  }

  const result = [];
  const sortedKeys = Object.keys(secondMap).sort();
  for (const timeKey of sortedKeys) {
    result.push({
      time: timeKey,
      bandwidth: secondMap[timeKey],
    });
  }

  return result;
}