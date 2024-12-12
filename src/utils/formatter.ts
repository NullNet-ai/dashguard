export const transformDropdown = (options: string[]) => {
  return options.map((option) => {
    return { label: option, value: option };
  });
};

export const testIDFormatter  = (input: string): string => {
  return input
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}