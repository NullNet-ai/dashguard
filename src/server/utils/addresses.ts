export const countriesAndCities: any = {
  "United States": ["New York", "Los Angeles"],
  "United Kingdom": ["London", "Manchester"],
  Australia: ["Sydney", "Melbourne"],
  Canada: ["Toronto", "Vancouver"],
  Japan: ["Tokyo", "Osaka"],
};

export const formatAddress = (address: any) => {
  const {
    address_line_one,
    address_line_two,
    city,
    state,
    postal_code,
    country,
  } = address || {};

  const formatted_address = [
    address_line_one,
    address_line_two,
    city,
    state && postal_code ? `${state} ${postal_code}` : state || postal_code,
    country,
  ]
    .filter(Boolean) // Remove undefined or empty parts
    .join(", ");
  return formatted_address;
};
