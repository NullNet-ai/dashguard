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

      const activation = await api.auth.adminActivateContactAccount({
        account_organization_id: result.account_record_id,
      });

      await api.account.archiveAccountInvitation({
        id: result.account_record_id,
      });

      return { ...result, ...activation };
    }
    return null;
  } catch (error) {
    throw error;
  }
};
