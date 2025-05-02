'use server';

import { api } from '~/trpc/server';

export const sendForgotPasswordEmail = async ({ email }: { email: string }) => {
  const response = await api.auth.sendForgotPasswordEmail({
    email,
  });
  return response
};
