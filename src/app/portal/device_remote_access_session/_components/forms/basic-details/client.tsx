'use client'

import { z } from 'zod'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useToast } from '~/context/ToastProvider'
import { api } from '~/trpc/react'

import { type IFormProps } from '../types'

const FormSchema = z.object({
  device_id: z.string({ message: 'Device is required' }).min(1, { message: 'Device is required' }),
  remote_access_type: z.string({ message: 'Connection Type is required' }).min(1, { message: 'Connection Type is required' }),
  device_service_id: z.string({ message: 'Service is required' }).min(1, { message: 'Service is required' }),
})

export default function RemoteAccessDetails(props: IFormProps) {
  // @ts-expect-error - No type yet
  const { record_data, deviceId, deviceCode, selectedTab } = props ?? {}
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    record_data?.device_id ?? undefined,
  )
  const hideRemoteAccessTypeField = selectedTab === 'ui' || selectedTab === 'ssh' || selectedTab === 'tty'
  const [remoteAccessType, setRemoteAccessType] = useState<string | undefined>(
    hideRemoteAccessTypeField ? selectedTab : record_data?.remote_access_type,
  )
  const toast = useToast()
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const { data: devices } = api.deviceRemoteAccessSession.fetchDevices.useQuery({
    limit: 100,
    device_code: deviceCode,
  })

  const effectiveDeviceId = deviceId || (deviceCode && devices?.[0]?.value) || selectedDeviceId
  const { data: deviceServices } = api.deviceRemoteAccessSession.fetchDeviceServices.useQuery(
    {
      limit: 100,
      device_code: deviceCode,
      device_id: effectiveDeviceId,
    },
    {
      refetchInterval: 60_000,
      enabled: !!effectiveDeviceId,
    },
  )

  const { data: deviceTunnels } = api.deviceRemoteAccessSession.fetchDeviceTunnels.useQuery(
    {
      limit: 500,
      device_code: deviceCode,
      device_id: effectiveDeviceId,
      tunnel_types: ['http', 'https'],
      status: 'Active',
    },
    {
      refetchInterval: 60_000,
      enabled: !!effectiveDeviceId,
    },
  )

  const uiTunnelServiceIds = useMemo(() => {
    const tunnels = Array.isArray(deviceTunnels) ? deviceTunnels : []
    return new Set(
      tunnels
        .map((t: any) => t?.service_id)
        .filter(Boolean),
    )
  }, [deviceTunnels])

  const filteredDeviceServices = useMemo(() => {
    const services = Array.isArray(deviceServices) ? deviceServices : []

    if (remoteAccessType === 'ssh') {
      return services.filter((e: any) => e.item?.protocol === 'ssh')
    } else if (remoteAccessType === 'tty') {
      return services.filter((e: any) => e.item?.protocol === 'tty')
    }

    if (remoteAccessType === 'ui') {
      return services.filter((e: any) => {
        const protocol = e.item?.protocol
        if (protocol !== 'http' && protocol !== 'https') return false
        return !uiTunnelServiceIds.has(e.item?.id)
      })
    }

    return services
  }, [deviceServices, remoteAccessType, uiTunnelServiceIds])

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
        device_service_id
      })
      if (res?.success && res) {
        const { remote_access_session } = res?.data[0] as Record<string, any>

        toast.success('Remote Access submitted successfully')

        const remote_access = ['ssh', 'tty']

        if (remote_access?.includes(remote_access_type)) {
          const wsUrl = {
            ssh: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/ssh`,
            tty: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/tty`,
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

  const formRef = useRef<any>(null)

  const handleFormChange = useCallback((form: any) => {
    formRef.current = form
  }, [])

  const clearSelectedDeviceService = useCallback(() => {
    const selectedServiceId = formRef.current?.getValues?.('device_service_id')
    if (!selectedServiceId) return

    formRef.current?.setValue?.('device_service_id', undefined, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    })
  }, [])

  const handleDataChange = useCallback((values: any) => {
    const nextRemoteAccessType = values?.remote_access_type ?? (hideRemoteAccessTypeField ? selectedTab : undefined)
    if (nextRemoteAccessType !== undefined) {
      setRemoteAccessType(nextRemoteAccessType)
    }

    if (!deviceId && !deviceCode) {
      setSelectedDeviceId(values?.device_id)
    }
  }, [deviceCode, deviceId, hideRemoteAccessTypeField, selectedTab])

  const prevDeviceKeyRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const currentDeviceKey = `${deviceCode ?? ''}:${effectiveDeviceId ?? ''}`
    const prevDeviceKey = prevDeviceKeyRef.current
    prevDeviceKeyRef.current = currentDeviceKey

    if (prevDeviceKey !== undefined && prevDeviceKey !== currentDeviceKey) {
      clearSelectedDeviceService()
    }
  }, [clearSelectedDeviceService, deviceCode, effectiveDeviceId])

  useEffect(() => {
    if (!formRef.current) return

    const selectedServiceId = formRef.current?.getValues?.('device_service_id')
    if (!selectedServiceId) return

    const allowedServiceIds = new Set(
      filteredDeviceServices
        .map((opt: any) => opt?.value)
        .filter(Boolean),
    )

    if (!allowedServiceIds.has(selectedServiceId)) {
      clearSelectedDeviceService()
    }
  }, [clearSelectedDeviceService, filteredDeviceServices, remoteAccessType])

  const defaultValues = useMemo(() => {
    if (!hideRemoteAccessTypeField) return record_data
    return {
      ...(record_data ?? {}),
      remote_access_type: selectedTab,
    }
  }, [hideRemoteAccessTypeField, record_data, selectedTab])

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-2 gap-4',
      }}
      defaultValues={defaultValues}
      onFormChange={handleFormChange}
      onDataChange={handleDataChange}
      fields={([
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
        ...(hideRemoteAccessTypeField ? [] : [{
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
        }]),
          formType: 'select' as any,
          name: 'device_service_id',
          label: 'Service',
          description: 'Field Description',
          // @ts-expect-error - No type yet
          label: 'Service',
          // @ts-expect-error - No type yet
          description: 'Field Description',
          placeholder: 'Enter value...',
          fieldClassName: '',
          readonly: false,
          required: true,
          selectSearchable: true,
          fieldStyle: {
            gridColumn: '1 / span 2',
            gridRow: hideRemoteAccessTypeField ? '3 / span 1' : '4 / span 1',
          },
        }
      ] as any)}
      formKey="formlabel"
      formLabel="Remote Access"
      formProps={record_data}
      formSchema={(deviceId || deviceCode)
        ? z.object({
          remote_access_type: z.string({ message: 'Connection Type is required' }).min(1, { message: 'Connection Type is required' }),
          device_service_id: z.string({ message: 'Service is required' }).min(1, { message: 'Service is required' }),
        })
        : FormSchema}
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
        device_service_id: filteredDeviceServices,
      }}
      formSaveButtonTitle='Connect'
    />
  )
}
