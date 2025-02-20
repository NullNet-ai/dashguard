import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { getLastMinutesTimeStamp } from '~/app/portal/device/utils/getHeartbeat'
import { Alert, AlertContent } from '~/components/ui/alert'
import { FormField } from '~/components/ui/form'
import { api } from '~/trpc/react'

import { BandwidthChart } from '../../../charts/AreaChart'

interface ISuccessfulConnectionDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>
  selectOptions?: Record<string, any>
}

export default function CustomSuccessfulConnectionDetails({
  form,
}: ISuccessfulConnectionDetails) {
  const pathName = usePathname()
  const [, , entity,, identifier] = pathName.split('/')

  const [chartData, setChartData] = React.useState([])
  // const createPackets = api.packet.createDynamicRecord.useMutation()

  const {
    data: record_device = { data: { id: null } },
  } = api.record.getByCode.useQuery({
    id: identifier!,
    pluck_fields: ['id', 'code', 'status'],
    main_entity: entity!,
  })

  const {
    refetch: fetchBandWidth,

  } = api.packet.getBandwithPerSecond.useQuery({
    device_id: record_device?.data?.id,
    time_range: getLastMinutesTimeStamp(3),
    bucket_size: '2s',

  })

  useEffect(() => {
    if (!record_device?.data?.id) return

    const fetchChartData = async () => {
      const { data } = await fetchBandWidth()
      if (data) {
        setChartData(data as any)
      }
    }
    fetchChartData()

    const interval = setInterval(fetchChartData, 1000)
    return () => {
      clearInterval(interval)
    }
  
  }, [record_device?.data?.id])

  return (
    <FormField
      control={form.control}
      name="SuccessfulConnection"
      render={() => {
        return (
          <div className="flex flex-col gap-2">
            <Alert className="pb-2" dismissible={true} variant="success">
              <AlertContent className="">
                Firewall Connected Successfully!
              </AlertContent>
            </Alert>

            <BandwidthChart chartData={chartData} />
          </div>
        )
      }}
    />
  )
}
