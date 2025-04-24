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
  byte_data: number;
};

export function updateBandwidth(data: SourceData[], packet: Packet): SourceData[] {
  const roundedTimestamp = new Date(packet.timestamp);
  roundedTimestamp.setMinutes(0, 0, 0); // Round down to the hour
  const bucketTime = roundedTimestamp.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:00:00"

  // Find the index of existing source_ip, if it exists
  const existingIndex: any = data.findIndex(entry => entry.source_ip === packet.source_ip);

  if (existingIndex !== -1) {
    const existingEntry: any = data[existingIndex];

    const result = existingEntry?.result;
    const match = result?.find((r: Record<string, any>) => r.bucket === bucketTime);

    if (match) {
      // Add to existing bandwidth
      match.bandwidth = (parseInt(match.bandwidth) + packet.byte_data).toString();
    } else {
      // Add new bucket
      result?.unshift({
        bucket: bucketTime,
        bandwidth: packet.byte_data.toString()
      });
    }

    // Keep only the latest 20 buckets sorted
    existingEntry.result = result
      .sort((a: Record<string, any>, b: Record<string, any>) => new Date(b?.bucket).getTime() - new Date(a?.bucket).getTime())
      .slice(0, 20);

    // Move the updated entry to the top of the list
    data.splice(existingIndex, 1); // Remove it
    data.unshift(existingEntry);  // Re-add it at the top

  } else {
    // New source_ip, create and add to top
    data.unshift({
      source_ip: packet.source_ip,
      result: [{
        bucket: bucketTime,
        bandwidth: packet.byte_data.toString()
      }],
      flag: "",
      name: "No IP Info"
    });
  }

  return data;
}



