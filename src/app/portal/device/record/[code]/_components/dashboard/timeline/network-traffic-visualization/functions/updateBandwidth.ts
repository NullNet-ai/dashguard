type BandwidthEntry = {
  bucket: string;       // "YYYY-MM-DD HH:00:00"
  bandwidth: string;    // Stored as string
};

type SourceData = {
  source_ip: string;
  result: BandwidthEntry[];
  flag: string;
  name: string;
};

type Packet = {
  source_ip: string;
  timestamp: string;     // ISO timestamp
  total_byte: number;
};

export function updateBandwidth(data: SourceData[], packet: Packet): SourceData[] {
  if (!data?.length || !Object.entries(packet)?.length) return data;
  // Create a copy of the data array to avoid direct mutations
  const updatedData = [...data];

  // Reset active status for all entries first
  updatedData.forEach((entry: Record<string, any>) => {
    entry.active = false;
    entry.isActive = false;
    entry.isNew = false;
    
    // Also reset the 'currentUpdate' flag for all time buckets in each entry
    if (entry.result && Array.isArray(entry.result)) {
      entry.result.forEach((timeEntry: Record<string, any>) => {
        timeEntry.currentUpdate = false;
      });
    }
  });

  // Get the actual timestamp with minutes and seconds from the packet
  const packetTimestamp = new Date(packet.timestamp);
  const exactBucketTime = packetTimestamp.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"

  // Find the index of existing source_ip, if it exists
  const existingIndex = updatedData.findIndex(entry => entry.source_ip === packet.source_ip);

  if (existingIndex !== -1) {
    // We found an existing entry - update it in place
    const existingEntry: any = updatedData[existingIndex];

    // If result array doesn't exist, initialize it
    if (!existingEntry.result || !Array.isArray(existingEntry.result)) {
      existingEntry.result = [];
    }

    // Find if there's already an entry for this exact time
    const bucketIndex = existingEntry.result.findIndex((r: Record<string, any>) => r.bucket === exactBucketTime);

    if (bucketIndex !== -1) {
      // Add to existing bandwidth for this exact time bucket
      const currentBandwidth = parseInt(existingEntry.result[bucketIndex].bandwidth) || 0;
      existingEntry.result[bucketIndex].bandwidth = (currentBandwidth + packet.total_byte).toString();

      // Store the newly added bandwidth value for display purposes
      existingEntry.result[bucketIndex].lastAddedBandwidth = packet.total_byte;
      
      // Mark this specific time bucket as the current update so it can be highlighted in UI
      existingEntry.result[bucketIndex].currentUpdate = true;
      existingEntry.result[bucketIndex].lastUpdateTime = new Date().toISOString();
    } else {
      // Add new time bucket to the result array
      existingEntry.result.push({
        bucket: exactBucketTime,
        bandwidth: packet.total_byte.toString(),
        lastAddedBandwidth: packet.total_byte,
        currentUpdate: true,
        lastUpdateTime: new Date().toISOString()
      });
      
      // Sort result array chronologically by bucket time
      existingEntry.result.sort((a: Record<string, any>, b: Record<string, any>) => {
        return new Date(a.bucket).getTime() - new Date(b.bucket).getTime();
      });
    }

    existingEntry.active = existingEntry.active ?? false; // Default to false if undefined
    existingEntry.isActive = existingEntry.isActive ?? false; // Default to false if undefined

    // Mark the entry as active
    existingEntry.active = true;
    existingEntry.isActive = true;

    // Ensure the entry has a default value for lastBandwidth
    existingEntry.lastBandwidth = packet.total_byte || existingEntry.lastBandwidth || 0;

    // Update the last update time
    existingEntry.lastUpdateTime = new Date().toISOString();

    // Keep track of which time bucket was most recently updated
    existingEntry.updatedTimeBucket = exactBucketTime || existingEntry.updatedTimeBucket || null;
    
    // Update in place - maintain the original position in the list
    updatedData[existingIndex] = existingEntry;
  } else {
    // This is a new source IP - add it to the top of the list
    const newEntry = {
      source_ip: packet.source_ip,
      result: [{
        bucket: exactBucketTime,
        bandwidth: packet.total_byte.toString(),
        lastAddedBandwidth: packet.total_byte,
        currentUpdate: true,
        lastUpdateTime: new Date().toISOString()
      }],
      flag: "/unknown-flag.svg",
      name: "No IP Info",
      active: true,
      isActive: true,
      isNew: true,
      lastBandwidth: packet.total_byte,
      lastUpdateTime: new Date().toISOString(),
      updatedTimeBucket: exactBucketTime
    };

    // Add new IP to the top of the list for visibility
    updatedData.unshift(newEntry);
  }

  return updatedData;
}
