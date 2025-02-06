'use server'

import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'

const verifySession = async () => {
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
  const response = await api.auth.login({
    username,
    password,
  })

  if ('statusCode' in response && response.statusCode !== 200) {
    return JSON.parse(JSON.stringify(response))
  }
  const verificationResponse = await verifySession()
  if (verificationResponse) {
    redirect('/portal/dashboard')
  }
}
