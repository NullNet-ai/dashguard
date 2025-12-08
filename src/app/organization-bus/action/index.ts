'use server';

import { redirect } from 'next/navigation';

export const redirectToDashboard = async () => {
  redirect('/portal/dashboard');
};
