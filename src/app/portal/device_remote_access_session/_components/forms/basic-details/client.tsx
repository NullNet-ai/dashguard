'use client'

import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  device_id: z.string({ message: 'Device is required' }).min(1, { message: 'Device is required' }),
  remote_access_type: z.string({ message: 'Connection Type is required' }).min(1, { message: 'Connection Type is required' }),
})

export default function RemoteAccessDetails(props: IFormProps) {
  const { record_data } = props
  const toast = useToast()
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const { data: devices } = api.deviceRemoteAccessSession.fetchDevices.useQuery({
    limit: 100,
  })

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const { device_id, remote_access_type } = data

      const res = await createUpdate.mutateAsync({
        id: record_data?.id || '',
        device_id,
        remote_access_type,
        category: remote_access_type?.toLowerCase() === 'console' ? 'Console' : 'Web',
      })
      if (res?.success && res) {
        const { remote_access_session } = res?.data[0] as Record<string, any>

        toast.success('Remote Access submitted successfully')

        const remote_access = ['console', 'shell']

        if (remote_access?.includes(remote_access_type)) {
          const wsUrl = `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL}/wss/`

          const sessionKey = `terminal_session_${Date.now()}_${Math.random().toString(36)
            .substring(2, 9)}`
          
          localStorage.setItem(sessionKey, wsUrl)

          localStorage.setItem('current_terminal_session', sessionKey)
          localStorage.setItem('device_id', device_id)
          
          // Set a flag in localStorage to reload the previous tab
          localStorage.setItem('reload_previous_tab', 'true');


          window.open(`/terminal`, '_blank')

          
        }
        else {
          // Set a flag in localStorage to reload the previous tab
          localStorage.setItem('reload_previous_tab', 'true');

          window.open(`https://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL}/`, '_blank')
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

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      defaultValues={record_data}
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
        {
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
        },
        {
          id: 'remote_access_type',
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
      ]}
      formKey="formlabel"
      formLabel="Remote Access"
      formProps={record_data}
      formSchema={FormSchema}
      handleSubmit={handleSave}
      myParent='wizard'
      selectOptions={{
        device_id: devices ?? [],
        remote_access_type: [
          {
            label: 'Console',
            value: 'console',
          },
          {
            label: 'Web Interface',
            value: 'web_interface',
          },
        ],
      }}
    />
  )
}
