'use server';

import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

export const resetPassword = async ({
  id,
  account_secret,
}: {
  id: string;
  account_secret: string;
}) => {
  // update password and is_new_user to false
  const response = await api.auth.resetPassword({
    id,
    account_secret,
  });
  if (response?.success) {
    redirect('/login');
  }
};
