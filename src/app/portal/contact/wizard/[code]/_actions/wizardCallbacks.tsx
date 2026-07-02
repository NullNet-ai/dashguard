'use client';

import { toast } from 'sonner';

import { type ICallbackHandler } from '~/components/platform/Wizard/type';
import { showTempPassword } from '~/components/platform/TempPasswordDialog';

import { updateAccountStatus } from '.';

const wizardCallbacks = {
  onClickWizardSave: async ({ data, next, socketClient }: any) => {
    try {
      const response = await updateAccountStatus(data);

      if (response) {
        if (response.temp_password) {
          await showTempPassword(response.temp_password);
          await next('Account created. Temporary password was displayed.');
        } else {
          await next('Account is already set up and is now active.');
        }
        return;
      }
      await next();
      return;
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return
      toast.error('Failed to activate account');
      return;
    }
  },
} as ICallbackHandler;

export default wizardCallbacks;
