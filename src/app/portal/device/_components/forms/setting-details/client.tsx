'use client'

import React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types/global/interfaces'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  is_traffic_monitoring_enabled: z.boolean().optional(),
  is_config_monitoring_enabled: z.boolean().optional(),
  is_telemetry_monitoring_enabled: z.boolean().optional(),
  // is_remote_access_enabled: z.boolean().optional(),
});
const SettingDetails = ({
  params,
  defaultValues,
  deviceCategory,
}: IFormProps & { deviceCategory?: string }) => {
  const updateSetting = api.device.updateDeviceSetting.useMutation()

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateSetting.mutateAsync({
        id: params.id,
        ...data,
      })
      if (res.status_code == 200) {
        toast.success('Settings submitted sucessfully')
      }
      return res
    }
    catch (error) {
      throw error
    }
  }

  return (
    <FormBuilder
      defaultValues={defaultValues}
      enableFormRegisterToParent = { true }
      customDesign={{ formClassName: 'grid !grid-cols-1 gap-4' }}
      fields={[
        {
          id: 'is_traffic_monitoring_enabled',
          formType: 'switch',
          name: 'is_traffic_monitoring_enabled',
          label: '',
          placeholder: 'Enable Traffic Monitoring',
          switchConfig: {
            rightLabel: (
              <span className="flex flex-col">
                <span>Enable Traffic Monitoring</span>
                <span className="text-sm text-muted-foreground">
                  Per-flow connection summaries (src/dst IP & port, protocol,
                  byte/packet counts) — not raw packets.
                </span>
              </span>
            ),
          },
        },
        // @ts-expect-error - No type yet
        ...(deviceCategory === 'Firewall'
          ? [
        {
          id: 'is_config_monitoring_enabled',
          formType: 'switch',
          name: 'is_config_monitoring_enabled',
          label: '',
          placeholder: 'Enable Config Monitoring',
          switchConfig: {
            rightLabel: (
              <span className="flex flex-col">
                <span>Enable Config Monitoring</span>
                <span className="text-sm text-muted-foreground">
                  Uploads parsed firewall config snapshots (filter/NAT
                  rules, aliases, interfaces) when config changes.
                </span>
              </span>
            ),
          },
        },
            ]
          : []),
        {
          id: 'is_telemetry_monitoring_enabled',
          // @ts-expect-error - No type yet
          formType: 'switch',
          name: 'is_telemetry_monitoring_enabled',
          label: '',
          placeholder: 'Enable Telemetry Monitoring',
          switchConfig: {
            rightLabel: (
              <span className="flex flex-col">
                <span>Enable Telemetry Monitoring</span>
                <span className="text-sm text-muted-foreground">
                  Streams host resource usage (CPU, memory, disk, disk I/O,
                  temperatures) sampled every second.
                </span>
              </span>
            ),
          },
        },
        // {
        //   id: 'is_remote_access_enabled',
        //   formType: 'switch',
        //   name: 'is_remote_access_enabled',
        //   label: 'Enable Remote Access',
        //   placeholder: 'Enable Remote Access',
        // },
      ]}
      formKey="setting_details"
      formLabel="Settings"
      formProps={params}
      formSchema={FormSchema}
      handleSubmit={handleSave}
      myParent={params.shell_type}
    />
  )
}

export default SettingDetails
