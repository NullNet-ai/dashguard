export const generateTimestamps = () => {
  const timestamps = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const timestamp = new Date(now.getTime() + i * 20 * 1000).toISOString();
    timestamps.push(timestamp);
  }

  return timestamps;
};