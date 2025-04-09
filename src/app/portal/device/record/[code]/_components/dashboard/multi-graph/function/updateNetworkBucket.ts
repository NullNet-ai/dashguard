
export function updateNetworkBuckets(
  buckets: Record<string,any>[],
  newData: Record<string,any>,
): Record<string,any>[] {
  const newTimestamp = new Date(newData.timestamp);
  const bucketTime = newTimestamp.toTimeString().split(' ')[0]; // "HH:MM:SS"
  const { interface_name, total_length } = newData;

  // Clone the original array to avoid mutation
  const updatedBuckets: any = [...buckets];
  const existingIndex = updatedBuckets.findIndex((b: {bucket: string}) => b.bucket === bucketTime);

  if (existingIndex !== -1) {
    // Bucket exists — update the correct interface
    const updatedBucket = { ...updatedBuckets[existingIndex] };
    updatedBucket[interface_name] += total_length;
    updatedBuckets[existingIndex] = updatedBucket;
  } else {
    const _keys = Object.keys(updatedBuckets[0]);
    // Bucket doesn't exist — create new one
    const newBucket: any = {
      bucket: bucketTime as string,
      // Initialize all interfaces to 0
      ...Object.fromEntries(_keys.filter((key) => key !== 'bucket').map((key) => [key, 0])),
      [interface_name]:total_length
    };
    // newBucket[interface_name] = total_length;
    updatedBuckets.push(newBucket);
    // Keep array length consistent by removing the oldest
    if (updatedBuckets.length > buckets.length) {
      updatedBuckets.shift();
    }
  }

  return updatedBuckets;
}
