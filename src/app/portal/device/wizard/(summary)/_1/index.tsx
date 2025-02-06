'use client'
import { startCase } from 'lodash'
import { usePathname } from 'next/navigation'

import { api } from '~/trpc/react'

import useRefetchRecord from '../hooks/useFetchMainRecord'

const fields = {
  model: 'model',
  instance_name: 'instance_name',
  grouping: 'grouping_name',
  country: 'country',
  state: 'state',
  city: 'city',
}

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname()

  const [, , , , identifier] = pathName.split('/')
  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.device.fetchBasicDetails.useQuery({
    code: identifier!,
  })

  const { data } = record ?? {}

  useRefetchRecord({
    refetch,
    form_key,
  })

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
      {Object.entries(fields).map(([key, value]) => (
        <p className = "mb-[8px]" key = { key }>
          <strong data-test-id={`device_${key}-wzd_sumry-key-${key}`}>
            {startCase(key)}
            :
          </strong>
          &nbsp;
          <span data-test-id={`device_${key}-wzd_sumry-value-${key}`}>
            {(data as { [key: string]: any })?.[value] || 'None'}
          </span>
        </p>
      ))}
    </div>
  )
}

const DeviceBasicDetailsSummary = {
  label: 'Step 1',
  required: false,
  components: [
    {
      label: 'Basic Details',
      component: <Summary form_key={"device_basic_details"} />,
    },
  ],
}
export default DeviceBasicDetailsSummary
