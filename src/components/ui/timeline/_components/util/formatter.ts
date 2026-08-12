// create function that format text 'contact_phone_number' to 'contact phone number' replace all _ to space
export function formatTextUnderScoreToSpace(text: string) {
  return text?.replace(/_/g, ' ');
}
