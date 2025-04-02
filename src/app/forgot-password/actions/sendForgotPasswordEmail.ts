'use server';

import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';

export const sendForgotPasswordEmail = async ({ email }: { email: string }) => {
  await api.auth.sendForgotPasswordEmail({
    email,
  });
  redirect('/forgot-password/submit-success')
};
