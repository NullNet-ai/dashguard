export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (!isFinite(bytes) || bytes < 0) return 'N/A';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals)) + ' ' + sizes[i];
}