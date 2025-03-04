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

  const accountDataResponse = await api.auth.getAccountData({ username });
  const { id, is_new_user } = accountDataResponse ?? {};

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
    return redirect(`/setup-password?filter_id=${id ?? ''}`);
  }

  /**
   * fetch organizations from contact_id
   */
  const fetchedOrganizations = await api.auth.fetchAccountDetailsThruEmail();

  if (fetchedOrganizations?.data?.length > 1) {
    return redirect('/login-organization');
  }

  const verificationResponse = await verifySession();
  if (verificationResponse) {
    redirect('/portal/dashboard');
  }
}
