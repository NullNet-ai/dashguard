'use server';

import { redirect } from 'next/navigation';

import { api } from '~/trpc/server';
import { handleLoginError } from '~/utils/login-validator';

export const verifySession = async () => {
  try {
    const verificationResponse = await api.auth.verify();
    return verificationResponse;
  } catch (error) {
    return false;
  }
};

export default async function LoginSubmit({
  username,
  password,
  invitation_id,
}: {
  username: string;
  password: string;
  invitation_id?: string;
}) {
  const loginDetailsResponse = await api.auth.login({
    username,
    password,
  });

  const loginDetailsError = handleLoginError(loginDetailsResponse);

  if (loginDetailsError) {
    return loginDetailsError;
  }
  /**
   * fetch organizations from contact_id
   */
  const fetchedOrganizations = await api.auth.fetchAccountDetailsThruEmail();
  // get account data
  const accountDataResponse = await api.auth.getAccountData({ username });

  const { is_new_user, status, account_organization_status, account_id } = accountDataResponse ?? {};

  if (
    (status !== 'Active' ||
      (account_organization_status &&
        !['Active', 'Pending Setup', 'Invited'].includes(
          account_organization_status ?? '',
        ))) &&
    fetchedOrganizations?.data?.length === 1
  ) {
    const errorMessages = {
      Deactivated:
        'Your account has been deactivated. Contact your administrator for assistance.',
      'Access Disabled':
        'Your account has been disabled. Contact your administrator for assistance.',
      Archived:
        'Your account is no longer active. Contact your administrator for assistance.',
    };
    return {
      valid: false,
      errorMessage:
        status === 'Archived'
          ? errorMessages.Archived
          : (errorMessages[account_organization_status as keyof typeof errorMessages] ??
            'Your account is no longer active. Contact your administrator for assistance.'),
    };
  }

  // archive invitation
  if (invitation_id) {
    await api.record.updateDynamicRecord({
      entity: 'invitation',
      id: invitation_id,
      data: {
        status: 'Archived',
      },
    });
  }

  if (is_new_user) {
    return redirect(`/setup-password?filter_id=${account_id ?? ''}`);
  }

  if (fetchedOrganizations?.data?.length > 1) {
    return redirect('/login-organization');
  }

  const verificationResponse = await verifySession();
  if (verificationResponse) {
    redirect('/portal/dashboard');
  }
}
