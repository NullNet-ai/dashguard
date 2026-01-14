'use client'

import { z } from 'zod'
import { useCallback, useState } from 'react'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  device_id: z.string({ message: 'Device is required' }).min(1, { message: 'Device is required' }),
  remote_access_type: z.string({ message: 'Connection Type is required' }).min(1, { message: 'Connection Type is required' }),
  device_service_id: z.string().optional(),
})

export default function RemoteAccessDetails(props: IFormProps) {
  // @ts-expect-error - No type yet
  const { record_data, deviceId, deviceCode } = props ?? {}
  const [remoteAccessType, setRemoteAccessType] = useState<string | undefined>(
    record_data?.remote_access_type,
  )
  const toast = useToast()
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const { data: devices } = api.deviceRemoteAccessSession.fetchDevices.useQuery({
    limit: 100,
    device_code: deviceCode,
  })
  const { data: deviceServices } = api.deviceRemoteAccessSession.fetchDeviceServices.useQuery({
    limit: 100,
    device_code: deviceCode,
    device_id: deviceId,
  })

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const { device_id, remote_access_type, device_service_id } = data

      const res = await createUpdate.mutateAsync({
        id: record_data?.id || '',
        device_id: deviceId || (deviceCode && devices?.[0]?.value) || device_id,
        remote_access_type,
        category: remote_access_type,
        device_service_id: device_service_id,
      })
      if (res?.success && res) {
        const { remote_access_session } = res?.data[0] as Record<string, any>

        toast.success('Remote Access submitted successfully')

        const remote_access = ['ssh', 'tty']

        if (remote_access?.includes(remote_access_type)) {
          const wsUrl = {
            ssh: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/wallguard/gateway/ssh`,
            tty: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/wallguard/gateway/tty`,
          }[remote_access_type]

          const sessionKey = `terminal_session_${Date.now()}_${Math.random().toString(36)
            .substring(2, 9)}`
          
          // @ts-expect-error - No type yet
          localStorage.setItem(sessionKey, wsUrl)

          localStorage.setItem('current_terminal_session', sessionKey)
          localStorage.setItem('current_terminal_session_type', remote_access_type)
          localStorage.setItem('device_id', deviceId || (deviceCode && devices?.[0]?.value) || device_id)
          
          // Set a flag in localStorage to reload the previous tab
          localStorage.setItem('reload_previous_tab', 'true');


          window.open(`/terminal`, '_blank')

          
        }
        else {
          // Set a flag in localStorage to reload the previous tab
          localStorage.setItem('reload_previous_tab', 'true');

          window.open(`https://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/`, '_blank')
        }
      }
      else {
        toast.error('Failed to submit Remote Access: Invalid response')
      }
    }
    catch (error: any) {
      console.error('Remote Access Error:', error)
      toast.error(`Failed to submit Remote Access: ${error.message || 'Unknown error'}`)
    }
  }

  // Add this code to reload the current tab if the flag is set
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const shouldReload = localStorage.getItem('reload_previous_tab');
      if (shouldReload === 'true') {
        localStorage.removeItem('reload_previous_tab'); // Remove the flag
        window.location.reload(); // Reload the current tab
      }
      localStorage.removeItem('reload_previous_tab'); // Remove the flag
    }
  });

  const handleDataChange = useCallback((values: any) => {
    setRemoteAccessType(values?.remote_access_type)
  }, [])

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      defaultValues={record_data}
      onDataChange={handleDataChange}
      fields={[
        {
          id: '',
          formType: 'space',
          name: '',
          label: '',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          fieldStyle: {},
        },
        {
          id: 'field_1744432010535',
          formType: 'space',
          name: 'field_1744432010535',
          label: 'New Field 2',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          fieldStyle: {},
        },
        // @ts-expect-error - No type yet
        ...((deviceId || deviceCode) ?
        [] : [{
          id: 'device_id',
          formType: 'select',
          name: 'device_id',
          label: 'Devices',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          readonly: !!record_data?.device_id || false,
          required: true,
          selectSearchable: true,
          fieldStyle: {
            gridColumn: '1 / span 2',
            gridRow: '2 / span 1',
          },
        }]),
        {
          id: 'remote_access_type',
          // @ts-expect-error - No type yet
          formType: 'select',
          name: 'remote_access_type',
          label: 'Connection Type',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          readonly: false,
          required: true,
          selectSearchable: true,
          fieldStyle: {
            gridColumn: '1 / span 2',
            gridRow: '3 / span 1',
          },
        },
        // @ts-expect-error - No type yet
        ...(remoteAccessType === 'ui' ?
        [{
          id: 'device_service_id',
          formType: 'select',
          name: 'device_service_id',
          label: 'Service',
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          readonly: false,
          required: false,
          selectSearchable: true,
          fieldStyle: {
            gridColumn: '1 / span 2',
            gridRow: '4 / span 1',
          },
        }] : []),
      ]}
      formKey="formlabel"
      formLabel="Remote Access"
      formProps={record_data}
      formSchema={(deviceId || deviceCode) ? z.object({
      remote_access_type: z.string({ message: 'Connection Type is required' }).min(1, { message: 'Connection Type is required' }),
      }) : FormSchema}
      handleSubmit={handleSave}
      myParent='wizard'
      selectOptions={{
        device_id: devices ?? [],
        remote_access_type: [
          {
            label: 'SSH',
            value: 'ssh',
          },
          {
            label: 'TTY',
            value: 'tty',
          },
          {
            label: 'UI',
            value: 'ui',
          },
        ],
        device_service_id: deviceServices ?? [],
      }}
      formSaveButtonTitle='Connect'
    />
  )
}
