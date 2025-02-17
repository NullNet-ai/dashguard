'use server';
import { redirect } from 'next/navigation';

import { verifySession } from '~/app/login/actions/loginSubmit';
import { api } from '~/trpc/server';
import { handleLoginError } from '~/utils/login-validator';

interface RegisterAccountArgs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization_name?: string;
}

export default async function registerAccount({
  first_name,
  last_name,
  email,
  password,
  organization_name,
}: RegisterAccountArgs) {
  let error = null;
  try {
    /**
     * Registration data
     */
    const organization = {
      name: organization_name,
      id: '',
    };

    const account = {
      first_name,
      last_name,
      email,
      password,
      account_id: email,
      account_secret: password,
      account_organization_name: organization_name,
      is_new_user: false,
    };

    /**
     * Register account
     */
    const registeredAccountDetails = await api.auth.registerAccount({
      account,
      organization,
    });

    const accountDataError = handleLoginError(registeredAccountDetails);
    if (accountDataError) {
      error = accountDataError;
      return error;
    }

    /**
     * Login using username and password
     */
    await api.auth.login({
      username: email,
      password,
    });

    await verifySession();

    /**
     * Create organization
     */
    const createdOrganizationResponse = await api.form.createDynamicRecord({
      entity: 'organization',
      data: {
        organization_name,
        categories: ['User'],
        entity: 'Contact',
      },
    });

    const organizationDataError = handleLoginError(createdOrganizationResponse);
    if (organizationDataError) {
      return organizationDataError;
    }

    const organization_id = createdOrganizationResponse?.data?.[0]?.id;

    /**
     * Create contact
     */
    const createdContactResponse = await api.form.createDynamicRecord({
      entity: 'contact',
      data: {
        first_name,
        last_name,
        status: 'Draft',
        categories: ['Contact'],
      },
    });

    const contact_id = createdContactResponse?.data?.[0]?.id;

    /**
     * Create organization contact
     */
    await api.form.createDynamicRecord({
      entity: 'organization_contacts',
      data: {
        contact_organization_id: organization_id,
        contact_id,
        is_primary: true,
      },
    });

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
    });
    
  } catch (err: any) {
    console.error(error);
    error = err;
  } finally {
    if (error as any) {
      return {
        error: (error as any)?.message ?? 'Something went wrong please try again',
        type: 'unknown',
      };
    }
    redirect('/portal/dashboard');
  }
}
