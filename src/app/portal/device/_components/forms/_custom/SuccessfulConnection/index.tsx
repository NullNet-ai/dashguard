import React from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { Alert, AlertContent } from '~/components/ui/alert'
import { FormField } from '~/components/ui/form'

import { FirewallChart } from '../../../charts/FirewallChart/client'

interface ISuccessfulConnectionDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>
  selectOptions?: Record<string, any>
}

export default function CustomSuccessfulConnectionDetails({
  form,
}: ISuccessfulConnectionDetails) {
  return (
    <FormField
      control={form.control}
      name="SuccessfulConnection"
      render={() => {
        return (
          <div className="flex flex-col gap-2">
            <Alert className = "pb-2" dismissible={true} variant = { "success" }>
              <AlertContent className = "">
                Firewall Connected Successfully!
              </AlertContent>
            </Alert>

            <FirewallChart device_id='' />
          </div>
        )
      } }
    />
  )
}
