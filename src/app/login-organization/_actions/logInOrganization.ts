'use server'

import { redirect } from 'next/navigation';
import { verifySession } from '~/app/login/actions/loginSubmit';
import { api } from '~/trpc/server';
import { handleLoginError } from '~/utils/login-validator';

type LoginOrganizationParameters = {
  username: string;
  password: string;
  organization_id: string;
}

const loginOrganization = async ({
  username, 
  password, 
  organization_id
}: LoginOrganizationParameters) => {
  
  const loginDetailsResponse = await api.auth.login({
    username,
    password,
    organization_id,
  })

  const loginDetailsError = handleLoginError(loginDetailsResponse);
  if (loginDetailsError) {
    return loginDetailsError;
  }

  await verifySession();

  return redirect('/portal/dashboard');
}

export default loginOrganization;