'use server';

import { api } from '~/trpc/server';

export const sendAccountInvitation = async (id: string) => {
  const response = await api.account.getAccountDetails({ id });
  console.log("🚀 ~ sendAccountInvitation ~ response:", response)
  return true;
};
