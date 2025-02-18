'use server';

import { api } from '~/trpc/server';

export const updateAccountStatus = async (data: any) => {
  try {
    const result = await api.account.createInvitationRecord({
      account_code: data.identifier,
    });
    return result.data;
  } catch (error) {
    throw error;
  }
};

export const updateAccountStatusByAccountId = async (id: string) => {
  try {
    const result = await api.account.createInvitationRecordByAccountId({
      account_id: id,
    });
    return result.data;
  } catch (error) {
    throw error;
  }
};


