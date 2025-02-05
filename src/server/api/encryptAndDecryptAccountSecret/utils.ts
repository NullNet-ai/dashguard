'use server'
import crypto from 'crypto'
import fs from 'fs'

import dotenv from 'dotenv'

dotenv.config()

const envFilePath = '.env'
const envKeyName = 'SECRET_KEY'

export const generateSecretKey = () => {
  if (!process.env[envKeyName]) {
    const secretKey = crypto.randomBytes(32).toString('base64')

    // Append or create the .env file with the secret key
    fs.appendFileSync(envFilePath, `\n${envKeyName}=${secretKey}\n`)
  }
  else {
    console.log('Secret key already exists in .env!')
  }
}
