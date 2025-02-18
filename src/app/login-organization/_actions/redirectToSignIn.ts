'use server'

import { redirect } from 'next/navigation'

const redirectToSignIn = async () => {
  redirect('/login')
}

export default redirectToSignIn
