'use client'

import { CheckIcon } from '@heroicons/react/20/solid'
import React, { useContext, useEffect, useState } from 'react'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { WizardContext } from '~/components/platform/Wizard/Provider'
import { api } from '~/trpc/react'

import CustomConfirmationDetails from '../_custom/Confirmation'
import CustomSuccessfulConnectionDetails from '../_custom/SuccessfulConnection'
import { type IFormProps } from '../types'

const FormSchema = z.object({
  connection: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
})
const Confirmation = ({ params, defaultValues }: IFormProps) => {
  const { actions } = useContext(WizardContext)
  const [loading, setLoading] = useState(true)

  const fetchConnectionStatus = api.device.fetchDeviceConnectionStatus.useQuery(
    {
      id: params.id,
    },
  )

  const handleSave = async () => {
    return Promise.resolve()
  }

  useEffect(() => {
    actions?.setCallback({
      customizeWizardButtonSave: {
        label: 'Finish',
        icon: <CheckIcon className="h-6 w-4 text-secondary" />,
        disableDropdown: true,
        disabled: loading,
        dropdownOptions: [],
      },
    })
  }, [loading])

  useEffect(() => {
    // This is a temporary solution to simulate the connection establishment
    const interval = setInterval(async () => {
      const { data } = await fetchConnectionStatus.refetch()
      const { is_connection_established = false } = data || {}

      if (is_connection_established) {
        setLoading(false)
        clearInterval(interval)
      }
    }, 2000)

    // setTimeout(() => {
    //   updateConnectionStatus.mutate({
    //     id: params.id,
    //   });
    // }, 10000);

    return () => clearInterval(interval)
  }, [])

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'lg:grid-cols-1 grid-cols-1',
      }}
      customRender={(form) => (
        <>
          {loading
            ? (
                <CustomConfirmationDetails form={form} />
              )
            : (
                <CustomSuccessfulConnectionDetails form={form} />
              )}
        </>
      )}
      defaultValues={defaultValues}
      fields={[]}
      formKey="confirmation"
      formLabel="Confirmation"
      formProps={params}
      formSchema={FormSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
    />
  )
}

export default Confirmation
