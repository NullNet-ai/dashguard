import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (phone: string, region: string): boolean => {
  try {
    const parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(
      phone.replace("+", ""),
      region || "US",
    );

    const validatePhone = phoneUtil.isValidNumber(parsedPhoneNumber);
    return validatePhone;
  } catch (error) {
    console.error("Error validating phone number:", error);
    return false;
  }
};
