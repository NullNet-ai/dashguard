import crypto from "crypto";

export class CredentialsGenerator {
  private static readonly APP_ID_LENGTH = 12;
  private static readonly APP_SECRET_LENGTH = 32;

  public static generateAppId() {
    return CredentialsGenerator.generateRandomString(
      CredentialsGenerator.APP_ID_LENGTH,
    );
  }

  public static generateAppSecret() {
    return CredentialsGenerator.generateRandomString(
      CredentialsGenerator.APP_SECRET_LENGTH,
    );
  }

  private static generateRandomString(length: number) {
    const randomBytes = crypto.randomBytes(Math.ceil((length * 3) / 4));
    return randomBytes.toString("base64").slice(0, length);
  }
}
