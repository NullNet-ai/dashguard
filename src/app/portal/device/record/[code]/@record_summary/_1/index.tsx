'use client'

import { Separator } from '~/components/ui/separator'
import StatusCell from '~/components/ui/status-cell'
import { api } from '~/trpc/react'

import useRefetchRecord from '../hooks/useFetchMainRecord'
import RecordDeviceLastHeartbeat from '../record_custom_query/RecordDeviceLastHeartbeat'
import RecordDeviceStatus from '../record_custom_query/RecordDeviceStatus'

const fields = {
  'Type': 'type',
  'Status': 'status',
  'Last Heartbeat': 'last_heartbeat',
  'Instance': 'instance_name',
  'Host Name': 'hostname',
  'Version': 'version',
  'Grouping': 'grouping',
  'Interfaces': 'interfaces',
  'Category': 'categories',
}

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
  const _data = {
    ...data,
    type: data?.model,
    grouping: data?.grouping_name,
    version: data?.device_version,
  }

  if (error) {
    return (
      <div>
        {"Error:"}
        {error.message}
      </div>
    )
  }

  return (
    <div>
      <div>
        {Object.entries(fields).map(([key, value], index) => {
          if (key !== 'Category') return null // Only process the 'Category' field

          const dataValue = (data as { [key: string]: any })?.[value as string]
          return (
            <div className='pt-2' key={index}>
              <div className='px-5'>
                <div className='p-1 text-sm'>
                  <div>
                    <span className='text-slate-400'>
                      {key}
                      {":"}
                      {' '}
                    </span>
                    {' '}
                    {/* Display the key 'Category' */}
                    {dataValue?.length
                      ? dataValue.map((item: string) => {
                          return <StatusCell key={item} value={item} />
                        })
                      : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Separator />
      <div>
        {Object.entries(fields).map(([key, value], index) => {
          if (key === 'Category') return null // Skip the 'Category' field as it is already processed

          return (
            <div className="pt-2" key={index}>
              <div className="px-5">
                <div className="p-1 text-sm">
                  <div>
                    <span className="text-slate-400">
                      {key}
                      {":"}
                      {' '}
                    </span>
                    <span>
                      {key === 'Status'
                        ? (<RecordDeviceStatus device_id={ data?.id } />
                          )
                        : key === 'Last Heartbeat'
                          ? (<RecordDeviceLastHeartbeat device_id={data?.id} />)
                          : key === 'Interfaces' ? (
                            <div className="pl-4" key={key}>
                              {Array.isArray(_data[value]) && _data[value].length > 0 ? (
                                _data[value].map((interfaceObj: { name: string; address: string }, index: number) => (
                                  <div key={index}>
                                    <span className="text-slate-400">
                                      {interfaceObj.name}
                                      {':'}
                                      {' '}
                                    </span>
                                    <span>
                                      {interfaceObj.address || 'None'}
                                    </span>
                                  </div>
                                ))
                              ) : 'None'}
                            </div>
                          ) 
                            : (
                                (_data as { [key: string]: any })?.[value as string]
                                || 'None'
                              )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RecordShellSummary
