'use server';

import { api } from '~/trpc/server';

export const updateAccountStatus = async (data: any) => {
  try {
    const accountOrg = await api.account.fetchWizardSummary({
      contact_code: data.identifier,
    });
    if (accountOrg.code) {
      const result = await api.account.createInvitationRecord({
        account_code: accountOrg.code,
      });
      return result;
    }
    return null;
  } catch (error) {
    throw error;
  }
};
