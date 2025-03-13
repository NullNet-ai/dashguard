'use server';
import { redirect } from 'next/navigation';

import { api } from '~/trpc/server';
import { handleLoginError } from '~/utils/login-validator';

interface LoginSubmitArgs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization_name?: string;
  organization_id?: string;
  account_id?: string;
  invitation_id?: string;
}

const verifySession = async () => {
  try {
    const verificationResponse = await api.auth.verify();
    return verificationResponse;
  } catch (error) {
    return false;
  }
};

export default async function registerAccountFromInvite({
  organization_name,
  organization_id,
  email,
  password,
  first_name,
  last_name,
  account_id,
  invitation_id,
}: LoginSubmitArgs) {
  // register user
  let error = null;
  const account = {
    id: account_id,
    first_name,
    last_name,
    email: email.toLowerCase(),
    password,
    account_id: email.toLowerCase(),
    account_secret: password,
    account_organization_id: organization_id,
    account_organization_name: organization_name,
    categories: ['External User'],
    is_new_user: false,
  };

  const organization = {
    id: organization_id,
    name: organization_name,
  };

  try {
    const registrationDetails = await api.auth.updateOrganizationAccount({
      account,
      organization,
    });

    if (!account_id) {
      throw new Error('Account ID is required');
    }
    /**
     * archive the invitation
     */

    if (invitation_id) {
      await api.record.updateDynamicRecord({
        entity: 'invitation',
        id: invitation_id,
        data: {
          status: 'Archived',
        },
      });
    }

    /**
     * Login
     */
    const loginDetailsResponse = await api.auth.login({
      username: email,
      password,
    });

    const loginDetailsError = handleLoginError(loginDetailsResponse);
    if (loginDetailsError) {
      return loginDetailsResponse;
    }

    /**
     * Verify session
     */
    await verifySession();

    return registrationDetails;
  } catch (err) {
    error = err;
    return {
      statusCode: 500,
      message: 'Something went wrong',
    };
  } finally {
    if (!error) {
      redirect('/portal/dashboard');
    }
  }
}
