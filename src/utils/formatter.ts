import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
export const transformDropdown = (options: string[]) => {
  return options.map((option) => {
    return { label: option, value: option };
  });
};

export const testIDFormatter = (input: string): string => {
  return input
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
};

// utils/phoneFormatter.js

export function formatPhoneNumber({
  raw_phone_number,
  iso_code,
}: {
  raw_phone_number: string;
  iso_code: string;
}) {
  if (!raw_phone_number || !iso_code) {
    return null;
  }
  // Parse the phone number using the ISO country code
  const phoneNumber = parsePhoneNumberFromString(
    raw_phone_number,
    iso_code.toLocaleUpperCase() as CountryCode,
  );
  if (!phoneNumber) {
    return "Invalid phone number";
  }
  // Check if the number is valid
  if (!phoneNumber.isValid()) {
    return "Invalid phone number";
  }
  // Format the phone number in international format
  const formatted_number = phoneNumber.formatInternational();
  return formatted_number;
}
