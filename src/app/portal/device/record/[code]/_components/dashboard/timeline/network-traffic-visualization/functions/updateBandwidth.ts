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
  });
  
  const roundedTimestamp = new Date(packet.timestamp);
  roundedTimestamp.setMinutes(0, 0, 0); // Round down to the hour
  const bucketTime = roundedTimestamp.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:00:00"

  // Find the index of existing source_ip, if it exists
  const existingIndex = updatedData.findIndex(entry => entry.source_ip === packet.source_ip);

  if (existingIndex !== -1) {
    // Get a reference to the existing entry
    const existingEntry: any = updatedData[existingIndex];
    
    // Update the entry's result
    const bucketIndex = existingEntry.result.findIndex((r: Record<string, any>) => r.bucket === bucketTime);
    
    if (bucketIndex !== -1) {
      // Add to existing bandwidth for this bucket
      const currentBandwidth = parseInt(existingEntry.result[bucketIndex].bandwidth) || 0;
      existingEntry.result[bucketIndex].bandwidth = (currentBandwidth + packet.total_byte).toString();
      
      // Store the newly added bandwidth value for display purposes
      existingEntry.result[bucketIndex].lastAddedBandwidth = packet.total_byte;
    } else {
      // Add new bucket
      existingEntry.result.unshift({
        bucket: bucketTime,
        bandwidth: packet.total_byte.toString(),
        lastAddedBandwidth: packet.total_byte // Store the newly added bandwidth
      });
    }

    // Keep only the latest 20 buckets sorted
    existingEntry.result = existingEntry.result
      .sort((a: Record<string, any>, b: Record<string, any>) => 
        new Date(b?.bucket).getTime() - new Date(a?.bucket).getTime())
      .slice(0, 20);
    
    // Mark this entry as active (will be shown in red)
    existingEntry.active = true;
    
    // Store the most recent bandwidth value for quick reference
    existingEntry.lastBandwidth = packet.total_byte;

    // Update in place - don't move to top
    updatedData[existingIndex] = existingEntry;
  } else {
    // New source_ip, create and add to top
    const newEntry = {
      source_ip: packet.source_ip,
      result: [{
        bucket: bucketTime,
        bandwidth: packet.total_byte.toString(),
        lastAddedBandwidth: packet.total_byte // Store the newly added bandwidth
      }],
      flag: "/unknown-flag.svg",
      name: "No IP Info",
      active: true,   // Mark as active (will be shown in red)
      isNew: true,    // Mark as new
      lastBandwidth: packet.total_byte // Store the initial bandwidth value
    };
    
    // Add new IP to the top of the list
    updatedData.unshift(newEntry);
  }

  return updatedData;
}



