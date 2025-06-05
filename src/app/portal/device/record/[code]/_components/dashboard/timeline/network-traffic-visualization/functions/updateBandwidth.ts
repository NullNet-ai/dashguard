import { getFlagDetails } from "~/app/api/device/get_flags";

type BandwidthEntry = {
  bucket: string;       // "YYYY-MM-DD HH:mm:ss"
  bandwidth: string;    // Stored as string
  currentUpdate?: boolean;
};

type SourceData = {
  source_ip: string;
  result: BandwidthEntry[];
  flag: string;
  name: string;
  active?: boolean;
  isActive?: boolean;
  isNew?: boolean;
};

type Packet = {
  source_ip: string;
  timestamp: string;     // ISO timestamp
  total_byte: number;
  ip_info?: any
};

export async function updateBandwidth(
  data: SourceData[],
  packet: Packet,
  time: any,
  searchBy?: any[]
): Promise<SourceData[]> {
  if (!Object.entries(packet)?.length) return data;

  // If data is empty, insert the packet as the first entry in the expected format
  if (!data || data.length === 0) {
    const flagDetails = await getFlagDetails(packet?.ip_info?.country);
    const { name, flag } = flagDetails || {};
    const packetTimestamp = new Date(packet.timestamp);
    const exactBucketTime = packetTimestamp.toISOString().slice(0, 19).replace('T', ' ');
    return [
      {
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
      }
    ];
  }

  const updatedData = [...data];

  updatedData.forEach((entry: Record<string, any>) => {
    entry.active = false;
    entry.isActive = false;
    entry.isNew = false;
    if (entry.result && Array.isArray(entry.result)) {
      entry.result.forEach((timeEntry: Record<string, any>) => {
        timeEntry.currentUpdate = false;
      });
    }
  });

  const packetTimestamp = new Date(packet.timestamp);
  const exactBucketTime = packetTimestamp.toISOString().slice(0, 19).replace('T', ' ');
  const currentSecond = packetTimestamp.toISOString().slice(17, 19);

  const existingIndex = updatedData.findIndex(entry => entry.source_ip === packet.source_ip);

  if (existingIndex !== -1) {
    const existingEntry: any = updatedData[existingIndex];
    if (!existingEntry.result || !Array.isArray(existingEntry.result)) {
      existingEntry.result = [];
    }

    // Update or insert the current second (do not remove old data)
    const secondIndex = existingEntry.result.findIndex((r: BandwidthEntry) => r.bucket === exactBucketTime);

    if (secondIndex !== -1) {
      existingEntry.result[secondIndex] = {
        ...existingEntry.result[secondIndex],
        bandwidth: packet.total_byte.toString(),
        bucket: exactBucketTime,
        currentUpdate: true,
      };
    } else {
      existingEntry.result.push({
        bucket: exactBucketTime,
        bandwidth: packet.total_byte.toString(),
        currentUpdate: true,
      });
    }

    existingEntry.result.sort((a: BandwidthEntry, b: BandwidthEntry) => {
      return new Date(a.bucket).getTime() - new Date(b.bucket).getTime();
    });

    existingEntry.active = true;
    existingEntry.isActive = true;
    updatedData[existingIndex] = existingEntry;
  } else {
    const flagDetails = await getFlagDetails(packet?.ip_info?.country);
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
    updatedData.unshift(newEntry);
  }

  // --- SEARCH LOGIC ---
  if (searchBy && searchBy[0]?.values?.length) {
    const searchSet = new Set(searchBy[0].values);
    searchBy[0].values.forEach((ip: string) => {
      if (!updatedData.some((entry: any) => entry.source_ip === ip)) {
        updatedData.push({
          source_ip: ip,
          result: [],
          flag: "/unknown-flag.svg",
          name: "No IP Info",
          active: false,
          isActive: false,
          isNew: false,
          ...time
        });
      }
    });
    const result = updatedData
      .filter((entry: any) => searchSet.has(entry.source_ip))
      .map((entry: any) => ({
        ...entry,
        active: entry.source_ip === packet.source_ip,
      }));
    return result;
  }

  return updatedData;
}