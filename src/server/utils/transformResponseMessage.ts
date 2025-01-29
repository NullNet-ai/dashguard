export const transformResMessage = (message: string): string => {
  return message.replace(/[^a-zA-Z0-9 ]/, ' ');
}