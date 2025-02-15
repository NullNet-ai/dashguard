'use server';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

interface LoginSubmitArgs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization_name?: string;
  organization_id?: string;
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
  };

  const organization = {
    id: organization_id,
    name: organization_name,
  }

  try {
    const registrationDetails = await api.auth.registerAccount({
      account,
      organization,
    });
  
    /**
     * Login
     */
    await api.auth.login({
      username: email,
      password,
    })
  
    /**
     * Verify session
     */
    await verifySession();
  
    /**
     * create contact
     */
    const createdContactResponse = await api.form.createDynamicRecord({
      entity: 'contact',
      data: {
        first_name,
        last_name,
        status: 'Draft',
        categories: ['Contact'],
      },
    })
  
    const contact_id = createdContactResponse?.data?.[0]?.id
    
    /**
     * Create contact email
     */
    await api.form.createDynamicRecord({
      entity: 'contact_email',
      data: {
        email,
        is_primary: true,
        contact_id,
      },
    })
  
    /**
     * Create contact organization
     */
    await api.form.createDynamicRecord({
      entity: 'organization_contacts',
      data: {
        contact_organization_id: organization_id,
        contact_id,
        is_primary: true,
      },
    })

    return registrationDetails;

  } catch (error) {
    return {
      statusCode: 500,
      message: 'Something went wrong',
    }
  } finally {
    // TODO: create an error handler for this
    redirect('/portal/dashboard')
  }
}
