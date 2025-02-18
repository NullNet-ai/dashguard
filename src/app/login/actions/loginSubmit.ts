'use server'

import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'
import { handleLoginError } from '~/utils/login-validator'

export const verifySession = async () => {
  try {
    const verificationResponse = await api.auth.verify()
    return verificationResponse
  }
  catch (error) {
    return false
  }
}

export default async function LoginSubmit({
  username,
  password,
}: {
  username: string
  password: string
}) {
  const loginDetails = await api.auth.login({
    username,
    password,
  })

  const loginDataError = handleLoginError(loginDetails);
  if (loginDataError) {
    return loginDataError
  }

  const accountDataResponse = await api.auth.getAccountData({ username })
  if (accountDataResponse?.is_new_user) {
    redirect(`/setup-password?filter_id=${accountDataResponse?.id ?? ''}`)
  }

  const verificationResponse = await verifySession()
  if (verificationResponse) {
    redirect('/portal/dashboard')
  }
}
