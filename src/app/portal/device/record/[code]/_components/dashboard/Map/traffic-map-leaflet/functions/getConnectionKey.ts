export const getConnectionKey = (sourceIP: string, destIP: string) => {
  return `${sourceIP}:${destIP}`;
};