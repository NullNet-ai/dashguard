import { getFlagDetails } from "~/app/api/device/get_flags";

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
  ip_info?: any
};

export async function updateBandwidth(data: SourceData[], packet: Packet, time: any): Promise<SourceData[]> {
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

  // Get the actual timestamp with hours and minutes from the packet
  const packetTimestamp = new Date(packet.timestamp);
  const exactBucketTime = packetTimestamp.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:MM:SS"
  const currentHour = packetTimestamp.toISOString().slice(11, 13); // "HH"
  const currentMinute = packetTimestamp.toISOString().slice(14, 16); // "MM"

  // Find the index of existing source_ip, if it exists
  const existingIndex = updatedData.findIndex(entry => entry.source_ip === packet.source_ip);

  if (existingIndex !== -1) {
    // We found an existing entry - update it in place
    const existingEntry: any = updatedData[existingIndex];

    // If result array doesn't exist, initialize it
    if (!existingEntry.result || !Array.isArray(existingEntry.result)) {
      existingEntry.result = [];
    }

    // Remove entries that do not belong to the current hour and minute
    existingEntry.result = existingEntry.result.filter((r: BandwidthEntry) => {
      const bucketHour = r.bucket.slice(11, 13); // Extract "HH" from the bucket
      const bucketMinute = r.bucket.slice(14, 16); // Extract "MM" from the bucket
      return bucketHour === currentHour && bucketMinute === currentMinute;
    });

    // Append the new time bucket to the result array
    existingEntry.result.push({
      bucket: exactBucketTime,
      bandwidth: packet.total_byte.toString(),
      currentUpdate: true,
    });

    // Sort result array chronologically by bucket time
    existingEntry.result.sort((a: BandwidthEntry, b: BandwidthEntry) => {
      return new Date(a.bucket).getTime() - new Date(b.bucket).getTime();
    });

    // Mark the entry as active
    existingEntry.active = true;
    existingEntry.isActive = true;

    // Update in place - maintain the original position in the list
    updatedData[existingIndex] = existingEntry;
  } else {
    const flagDetails = await getFlagDetails(packet?.ip_info?.country);
    // This is a new source IP - add it to the top of the list
    const { name, flag } = flagDetails || {};
    const newEntry = {
      source_ip: packet.source_ip,
      result: [{
        bucket: exactBucketTime,
        bandwidth: packet.total_byte.toString(),
        currentUpdate: true,
      }],
      flag: flag || "/unknown-flag.svg",
      name: name || "No IP Info",
      active: true,
      isActive: true,
      isNew: true,
      ...time
    };

    // Add new IP to the top of the list for visibility
    updatedData.unshift(newEntry);
  }

  return updatedData;
}
