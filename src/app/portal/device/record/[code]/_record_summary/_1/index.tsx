'use client'

import { api } from '~/trpc/react'
import { useMemo } from 'react'

import useRefetchRecord from '../hooks/useFetchMainRecord'
import RecordDeviceLastHeartbeat from '../record_custom_query/RecordDeviceLastHeartbeat'
import RecordDeviceStatus from '../record_custom_query/RecordDeviceStatus'
import SummaryDetails from '~/components/platform/Record/Summary/SummaryDetails'

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string
  identifier: string
  main_entity: string
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.device.fetchRecordShellSummary.useQuery({
    code: identifier!,
  })

  const { data } = record ?? {}

  useRefetchRecord({
    refetch,
    form_key,
  })

  const deviceData = useMemo(() => {
    if (!data) return {}
    
    return {
      ...data,
      type: data?.model,
      grouping: data?.grouping_name,
      version: data?.device_version,
      interfaces: data?.interfaces || [],
      device_category: data?.device_category || 'None'
    }
  }, [data])

  if (error) {
    console.error("Error fetching record summary", error)
  }

  return (
    <SummaryDetails
      data={deviceData}
      config={[
        {
          header_title: "Device Details",
          items: [
            {
              key: "Type",
              value: "device_type",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Status",
              value: "status",
              customValue: (data: any) => <RecordDeviceStatus device_id={data?.id} />
            },
            {
              key: "Last Heartbeat",
              value: "last_heartbeat",
              customValue: (data: any) => <RecordDeviceLastHeartbeat device_id={data?.id} />
            },
            {
              key: "Instance",
              value: "device_name",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Host Name",
              value: "hostname",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Version",
              value: "version",
              truncated: () => ({ string_limit: 35, path: ['value'] })
            },
            {
              key: "Interfaces",
              value: "interfaces",
              customValue: (data: any) => {
                const interfaceData = data?.interfaces || [];
                return (
                  <div className="pl-4">
                    {Array.isArray(interfaceData) && interfaceData.length > 0 ? (
                      interfaceData.map((interfaceObj: { name: string; address: string }, index: number) => (
                        <div key={index} className="mb-1">
                          <span className="text-slate-400">
                            {interfaceObj.name?.toUpperCase() || 'Unknown'}
                            {':'}
                            {' '}
                          </span>
                          <span>
                            {interfaceObj.address || 'None'}
                          </span>
                        </div>
                      ))
                    ) : typeof interfaceData === 'string' ? (
                      interfaceData
                    ) : 'None'}
                  </div>
                );
              }
            }
          ]
        }
      ]}
    />
  )
}

export default RecordShellSummary