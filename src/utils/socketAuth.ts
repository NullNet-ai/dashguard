export const decryptCredentials = (
  encodedData: string,
): { username: string; password: string } => {
  try {
    const decoded = atob(encodedData);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Failed to decrypt credentials');
  }
};

// Server-side encoding function to add to socketAuth.ts
export const encryptCredentials = (
  username: string,
  password: string,
): string => {
  const credentials = JSON.stringify({ username, password });
  return btoa(credentials);
};
