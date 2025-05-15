export function updateFilteredData(
  buckets: Record<string, any>[],
  newData: Record<string, any>,
): Record<string, any>[] {
  const newTimestamp = new Date(newData.timestamp);
  const bucketHour = newTimestamp.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
  const byteData = typeof newData.total_byte === 'string' 
    ? parseInt(newData.total_byte, 10) 
    : newData.total_byte;

  // Clone the original array to avoid mutation
  const updatedBuckets = [...buckets];
  const existingIndex = updatedBuckets.findIndex(b => b.bucket === bucketHour);

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
      bucket: bucketHour,
      bandwidth: byteData.toString(),
    };

    updatedBuckets.push(newBucket);

    // Sort buckets by time to ensure chronological order
    updatedBuckets.sort((a, b) => a.bucket.localeCompare(b.bucket));

    // Keep array length consistent by removing the oldest if needed
    if (updatedBuckets.length > buckets.length && buckets.length > 0) {
      updatedBuckets.shift();
    }
  }

  return updatedBuckets;
}