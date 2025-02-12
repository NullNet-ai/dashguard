'use server';

import { redirect } from 'next/navigation';

import { api } from '~/trpc/server';
import { handleLoginError } from '~/utils/login-validator';

const verifySession = async () => {
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
}: {
  username: string;
  password: string;
}) {
  const response = await api.auth.login({
    username,
    password,
  });

  const error = handleLoginError(response);
  if (error) {
    return error;
  }

  const accountDataResponse = await api.auth.getAccountData({ username });

  const accountDataError = handleLoginError(accountDataResponse);

  if (accountDataError) {
    return accountDataError;
  }

  if (accountDataResponse?.is_new_user) {
    redirect(`/setup-password?filter_id=${accountDataResponse?.id ?? ''}`);
  }

  const verificationResponse = await verifySession();
  if (verificationResponse) {
    redirect('/portal/dashboard');
  }
}
