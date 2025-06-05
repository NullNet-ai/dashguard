export function updateFilteredData(
  buckets: Record<string, any>[],
  newData: Record<string, any>,
): Record<string, any>[] {
  const newTimestamp = new Date(newData.timestamp);

  // Convert UTC to PHT and format as "HH:mm:ss"
  const bucketSecond = newTimestamp.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Manila', // Convert to Philippine Time
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  });


  const byteData = typeof newData.total_byte === 'string' 
    ? parseInt(newData.total_byte, 10) 
    : newData.total_byte;

  // Clone the original array to avoid mutation
  const updatedBuckets = [...buckets];
  const existingIndex = updatedBuckets.findIndex(b => b.bucket === bucketSecond);

  if (existingIndex !== -1) {
    // Bucket exists — update the bandwidth
    const updatedBucket = { ...updatedBuckets[existingIndex] };
    const currentBandwidth = parseInt(updatedBucket.bandwidth, 10);
    updatedBucket.bandwidth = (currentBandwidth + byteData).toString();
    updatedBuckets[existingIndex] = updatedBucket;
  } else {
    // Use structure from existing item if available
    const template = buckets[0] ? { ...buckets[0] } : {};
    const newBucket = {
      ...template,
      bucket: bucketSecond, // Use "HH:mm:ss" format in PHT
      bandwidth: byteData.toString(),
    };

    updatedBuckets.push(newBucket);

    // Sort buckets by time to ensure chronological order
    updatedBuckets.sort((a, b) => a.bucket.localeCompare(b.bucket));
    const MAX_BUCKETS = 60;
    // Keep array length consistent by removing the oldest if needed
    if (updatedBuckets.length > MAX_BUCKETS) { //buckets.length && buckets.length > 0) {
      updatedBuckets.shift();
    }
  }

  return updatedBuckets;
}