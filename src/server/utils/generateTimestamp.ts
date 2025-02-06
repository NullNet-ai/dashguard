export const generateTimestamps = (date: Date) => {
  const timestamps = [];
  const now = date;

  for (let i = 0; i < 6; i++) {
    const timestamp = new Date(now.getTime() + i * 20 * 1000).toISOString();
    timestamps.push(timestamp);
  }

  return timestamps;
};