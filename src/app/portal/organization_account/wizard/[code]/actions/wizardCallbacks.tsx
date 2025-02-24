'use client';

import { type ICallbackHandler } from '~/components/platform/Wizard/type';
import { updateAccountStatus } from '.';
import { toast } from 'sonner';

const wizardCallbacks = {
  onClickWizardSave: async ({ data, next }: any) => {
    try {
      const result = await updateAccountStatus(data);
      if (result?.id) {
        await next('Account is created successfully and invitation is sent');
        return;
      }
      toast.error('Failed to activate the account');
      return;
    } catch {
      toast.error('Failed to activate account');
      return;
    }
  },
} as ICallbackHandler;

export default wizardCallbacks;
