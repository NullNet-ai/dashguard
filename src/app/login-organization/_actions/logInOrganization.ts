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

  await verifySession();

  return redirect('/portal/dashboard');
};

export default loginOrganization;
