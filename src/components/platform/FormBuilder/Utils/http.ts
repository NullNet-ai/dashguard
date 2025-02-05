export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300;
};
