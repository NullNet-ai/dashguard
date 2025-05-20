'use server'

import { redirect } from 'next/navigation'

export const redirectToSignIn = async () => {
  redirect('/login')
}
