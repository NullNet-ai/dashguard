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
  const loginDetailsResponse = await api.auth.login({
    username,
    password,
  })

  const loginDetailsError = handleLoginError(loginDetailsResponse);

  if (loginDetailsError) {
    return loginDetailsError
  }

  const accountDataResponse = await api.auth.getAccountData({ username })
  const { id, is_new_user, contact_id } = accountDataResponse ?? {};

  if (is_new_user) {
    redirect(`/setup-password?filter_id=${id ?? ''}`);
  }

  /**
   * fetch organizations from contact_id
   */
  const fetchedOrganizations = await api.organizationContact.fetchOrganizations({
    contact_id,
  });
  const { data } = fetchedOrganizations?? {};

  
  if (data?.organizations?.length) {
  // if (data?.organizations?.length > 0) {
    // redirect(`/login-organization/${contact_id?? ''}`);
    
  }

  const verificationResponse = await verifySession();
  if (verificationResponse) {
    redirect('/portal/dashboard')
  }
}
