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
      contact_categories: ['Contact', 'User'],
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

    const { organization_account_id, organization_id, contact_id } =
      registeredAccountDetails?.data?.[0] ?? {};

    /**
     * Login using username and password
     */
    await api.auth.login({
      username: email,
      password,
    });

    await verifySession();

    /**
     * Create user Role
     */
    const userRole = await api.form.createDynamicRecord({
      entity: 'user_roles',
      data: {
        role: 'Administrator',
        entity: 'Contact',
        categories: ['User'],
        status: 'Active',
      },
    });

    /**
     * Update account record
     */
    await api.form.updateDynamicRecord({
      id: organization_account_id,
      entity: 'organization_account',
      data: {
        role_id: userRole.data?.[0]?.id,
        categories: ['Internal User'],
        status: 'Active',
        account_status: 'Active',
      },
    });
    const organizationContact = await api.form.createDynamicRecord({
      entity: 'organization_contacts',
      data: {
        contact_organization_id: organization_id,
        contact_id: contact_id,
        is_primary: true,
        status: 'Active',
      },
    });
    await api.form.createDynamicRecord({
      entity: 'organization_contact_user_roles',
      data: {
        organization_contact_id: organizationContact?.data?.[0]?.id,
        user_role_id: userRole?.data?.[0]?.id,
        status: 'Active',
      },
    });
  } catch (err: any) {
    console.error(error);
    error = err;
  } finally {
    if (error as any) {
      return {
        error:
          (error as any)?.message ?? 'Something went wrong please try again',
        type: 'unknown',
      };
    }
    redirect('/portal/dashboard');
  }
}
