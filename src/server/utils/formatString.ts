export function formatString(str: string): string {
  if (!str) return '';
  return str
    .split('_') // Split the string by underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words with spaces
}