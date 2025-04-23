'use client';

import { toast } from 'sonner';

import { type ICallbackHandler } from '~/components/platform/Wizard/type';

import { updateAccountStatus } from '.';

const wizardCallbacks = {
  onClickWizardSave: async ({ data, next, socketClient }: any) => {
    try {
      const response = await updateAccountStatus(data);

      if (response) {
        socketClient.publish({
          type:
            response?.accountRecord?.categories[0] === 'Internal User'
              ? 'ACCOUNT_INVITE_INTERNAL'
              : 'ACCOUNT_INVITE_EXTERNAL',
          payload: response,
        });
        await next('Account is created successfully and invitation is sent');
        return;
      }
      await next();
      return;
    } catch {
      toast.error('Failed to activate account');
      return;
    }
  },
} as ICallbackHandler;

export default wizardCallbacks;
