'use server'
import { redirect } from 'next/navigation'

import { api } from '~/trpc/server'
import { handleLoginError } from '~/utils/login-validator'

interface LoginSubmitArgs {
  first_name: string
  last_name: string
  email: string
  password: string
  organization_name?: string
  organization_id?: string
}

const verifySession = async () => {
  try {
    const verificationResponse = await api.auth.verify()
    return verificationResponse
  }
  catch (error) {
    return false
  }
}

export default async function registerAccountFromInvite({
  organization_name,
  organization_id,
  email,
  password,
  first_name,
  last_name,
}: LoginSubmitArgs) {
  // register user
  let error = null
  const account = {
    first_name,
    last_name,
    email,
    password,
    account_id: email,
    account_secret: password,
    account_organization_id: organization_id,
    account_organization_name: organization_name,
    is_new_user: false,
  }

  const organization = {
    id: organization_id,
    name: organization_name,
  }

  try {
    const registrationDetails = await api.auth.registerAccount({
      account,
      organization,
    })

    /**
     * Login
     */
    const loginDetailsResponse = await api.auth.login({
      username: email,
      password,
    })

    const loginDetailsError = handleLoginError(loginDetailsResponse)
    if (loginDetailsError) {
      return loginDetailsResponse
    }

    /**
     * Verify session
     */
    await verifySession()

    /**
     * create contact
     */
    const contact_id = registrationDetails.data?.[0]?.contact_id
    const contactDetailsResponse = await api.form.updateDynamicRecord({
      entity: 'contact',
      id: contact_id,
      data: {
        first_name,
        last_name,
        status: 'Draft',
        categories: ['Contact'],
      },
    })

    const contactDetailsError = handleLoginError(contactDetailsResponse)
    if (contactDetailsError) {
      return contactDetailsResponse
    }

    return registrationDetails
  }
  catch (err) {
    error = err
    return {
      statusCode: 500,
      message: 'Something went wrong',
    }
  }
  finally {
    if (!error) {
      redirect('/portal/dashboard')
    }
  }
}
