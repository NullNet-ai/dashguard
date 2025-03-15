'use client'

import { toast } from 'sonner'

import { type ICallbackHandler } from '~/components/platform/Wizard/type'
import { updateCommunicationTemplateStatus } from '.'


const wizardCallbacks = {
  onClickWizardSave: async ({ data, next }: any) => {
    try {
      const result = await updateCommunicationTemplateStatus(data)
      if (result) {
        await next();
        return;
      }
      toast.error('Failed to activate the account')
      return 
    }
    catch {
      toast.error('Failed to activate account')
      return
    }
  },
} as ICallbackHandler

export default wizardCallbacks
