'use server';

import { redirect } from 'next/navigation';

export const redirectToDashboard = () => {
  redirect('/portal/dashboard');
};
