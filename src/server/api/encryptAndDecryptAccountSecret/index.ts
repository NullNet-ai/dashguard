import crypto from 'crypto'

import dotenv from 'dotenv'

import { generateSecretKey } from './utils'

dotenv.config()

// Ensure the secret key is generated and available
generateSecretKey()

const secretKey = process.env.SECRET_KEY
export const encrypt = (text: string) => {
  try {
    if (!secretKey) {
      throw new Error('SECRET_KEY is not defined in environment variables')
    }

    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secretKey, 'base64'), iv)
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
  }
  catch (error) {
    console.error(error)
  }
}

export const decrypt = (encryptedText: string) => {
  try {
    const data = Buffer.from(encryptedText, 'base64')
    const iv = data.slice(0, 12)
    const authTag = data.slice(12, 28)
    const encrypted = data.slice(28)

    if (!secretKey) {
      throw new Error('SECRET_KEY is not defined in environment variables')
    }
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(secretKey, 'base64'), iv)
    decipher.setAuthTag(authTag)

    return decipher.update(encrypted, 'binary', 'utf8') + decipher.final('utf8')
  }
  catch (error) {
    console.error(error)
  }
}
