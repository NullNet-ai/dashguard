'use server'
import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

import { verifySession } from './loginSubmit'

const {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
} = process.env

const redirectToSignUp = async () => {
  await api.auth.login({
    username: ADMIN_USERNAME!,
    password: ADMIN_PASSWORD!,
  })
  await verifySession()
  redirect('/sign-up')
}

export default redirectToSignUp
