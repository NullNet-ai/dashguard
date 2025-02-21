'use server'

import { redirect } from 'next/navigation'
import { api } from '~/trpc/server'

const redirectToSignIn = async () => {
  await api.auth.logout();
  return redirect('/login')
}

export default redirectToSignIn
