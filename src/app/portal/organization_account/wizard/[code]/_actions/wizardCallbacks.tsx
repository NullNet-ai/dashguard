'use client';

import { toast } from 'sonner';

import { type ICallbackHandler } from '~/components/platform/Wizard/type';

import { updateAccountStatus } from '.';

const wizardCallbacks = {
  onClickWizardSave: async ({ data, next, socketClient }: any) => {
    try {
      const response = await updateAccountStatus(data);
      socketClient.publish({
        type: 'ACCOUNT_INVITE',
        payload: response,
      });
      if (response) {
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
