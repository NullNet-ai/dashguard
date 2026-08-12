'use client';

import { toast } from 'sonner';

import { type ICallbackHandler } from '~/components/platform/Wizard/type';

import { updateAccountStatus } from '.';

const wizardCallbacks = {
  onClickWizardSave: async ({ data, next }: any) => {
    try {
      const response = await updateAccountStatus(data);
      if (response) {
        await next('Device successfully activated');
        return;
      }
      toast.error('Failed to activate the device');
      return;
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return
      toast.error('Failed to activate account');
      return;
    }
  },
} as ICallbackHandler;

export default wizardCallbacks;
