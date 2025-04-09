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
  total_length: number;
};

export function updateBandwidth(data: SourceData[], packet: Packet): SourceData[] {
  console.log('%c Line:20 🌶 data', 'color:#fca650', data);
  const roundedTimestamp = new Date(packet.timestamp);
  roundedTimestamp.setMinutes(0, 0, 0); // Round down to the hour
  const bucketTime = roundedTimestamp.toISOString().slice(0, 19).replace('T', ' '); // "YYYY-MM-DD HH:00:00"

  const existingEntry = data.find(entry => entry.source_ip === packet.source_ip);

  if (existingEntry) {
      const result = existingEntry.result;
      const match = result.find(r => r.bucket === bucketTime);

      if (match) {
          match.bandwidth = (parseInt(match.bandwidth) + packet.total_length).toString();
      } else {
          result.unshift({
              bucket: bucketTime,
              bandwidth: packet.total_length.toString()
          });
      }

      // Keep only the latest 20 buckets sorted by time descending
      existingEntry.result = result
          .sort((a, b) => new Date(b.bucket).getTime() - new Date(a.bucket).getTime())
          .slice(0, 20);
  } else {
      data.push({
          source_ip: packet.source_ip,
          result: [{
              bucket: bucketTime,
              bandwidth: packet.total_length.toString()
          }],
          flag: "", // Placeholder, can be set dynamically
          name: "No IP Info"
      });
  }

  console.log('%c Line:57 🌰 data', 'color:#3f7cff', data);
  return data;
}
