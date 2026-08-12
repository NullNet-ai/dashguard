'use server';

import { api } from '~/trpc/server';

export const updateAccountStatus = async (data: any) => {
  try {
    const accountOrg = await api.account.fetchWizardSummary({
      contact_code: data.identifier,
    });
    // @ts-ignore-error - No type yet
    if (accountOrg.code) {
      const result = await api.account.createInvitationRecord({
        // @ts-ignore-error - No type yet
        account_code: accountOrg.code,
      });
      return result;
    }
    return null;
  } catch (error) {
    throw error;
  }
};
