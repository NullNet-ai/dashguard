'use server'

import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

export const redirectToSignIn = async () => {
  await api.auth.logout()
  redirect('/login')
}
