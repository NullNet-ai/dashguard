export const getStringFormat = (value: string) => {
  if (typeof value !== 'string') return 'not_string';
  if (value.trim() === '') return 'empty';
  
  const trimmed = value.trim();
  
  if (/^{.*}$/.test(trimmed)) return 'curly_braces';
  if (/^\[.*\]$/.test(trimmed)) return 'square_brackets';
  if (trimmed.includes(',') && !trimmed.startsWith('{') && !trimmed.startsWith('[')) return 'comma_separated';
  
  return 'regular_string';
};