'use server';

import { headers } from 'next/headers';
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
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , id] = pathname.split('/');
  const loginDetailsResponse = await api.auth.login({
    username: username.toLowerCase(),
    password,
  });

  const loginDetailsError = handleLoginError(loginDetailsResponse);

  if (loginDetailsError) {
    return loginDetailsError;
  }
  /**
   * fetch organizations from contact_id
   */
  const fetchedAccountOrganizations =
  await api.auth.fetchAccountDetailsThruEmail();
  // get account data
  const accountDataResponse = await api.auth.getAccountData();

  const { status, account_organization_status, account_id } =
    accountDataResponse ?? {};
  const is_new_user =
    fetchedAccountOrganizations?.is_new_user ?? accountDataResponse?.is_new_user;

  if (
    (status !== 'Active' ||
      (account_organization_status &&
        !['Active', 'Pending Setup', 'Invited'].includes(
          account_organization_status ?? '',
        ))) &&
    fetchedAccountOrganizations?.organizations?.length === 1
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
          : (errorMessages[
              account_organization_status as keyof typeof errorMessages
            ] ??
            'Something went wrong. Contact your administrator for assistance.'),
    };
  }

  // archive invitation
  if (invitation_id && id) {
    await Promise.all([
      api.record.updateDynamicRecord({
        entity: 'invitation',
        id: invitation_id,
        data: {
          status: 'Archived',
        },
      }),
      api.record.updateDynamicRecord({
        entity: 'account_organization',
        id,
        data: {
          account_organization_status: 'Active',
        },
      }),
    ]);
    // await api.record.updateDynamicRecord({
    //   entity: 'invitation',
    //   id: invitation_id,
    //   data: {
    //     status: 'Archived',
    //   },
    // });
  }

  if (is_new_user) {
    return redirect(`/setup-password?filter_id=${account_id ?? ''}`);
  }

  if (fetchedAccountOrganizations?.organizations?.length > 1) {
    return redirect('/login-organization');
  }

  const verificationResponse = await verifySession();
  if (verificationResponse) {
    redirect('/portal/device/grid');
  }
}
