'use server';

import { redirect } from 'next/navigation';
import { verifySession } from '~/app/login/_actions/loginSubmit';
import { api } from '~/trpc/server';

const loginOrganization = async (login_organization_id: string) => {
  const loginSessionDetails = await api.auth.switchOrganization({
    organization_id: login_organization_id,
  });

  if (!loginSessionDetails?.token) {
    return {
      error: 'No token found!',
    };
  }

  const accountDataResponse = await api.auth.getAccountData();
  const { status, account_organization_status, organization } = accountDataResponse ?? {};

  if (
    status !== 'Active' ||
    (account_organization_status &&
      !['Active', 'Pending Setup', 'Invited'].includes(account_organization_status ?? ''))
  ) {
    const errorMessages = {
      Deactived:
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

  await verifySession();

  return redirect('/portal/dashboard');
};

export default loginOrganization;
