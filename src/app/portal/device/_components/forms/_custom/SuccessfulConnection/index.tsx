// https://typescript-eslint.io/rules/no-misused-promises
import React, { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { Alert, AlertContent } from '~/components/ui/alert'
import { FormField } from '~/components/ui/form'
import { api } from '~/trpc/react'

import { AreaChartSample } from '../../../charts/AreaChart'
import { getLastMinutesTimeStamp, getLastSecondsTimeStamp } from '~/app/portal/device/utils/getHeartbeat';


interface ISuccessfulConnectionDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>
  selectOptions?: Record<string, any>
}

export default function CustomSuccessfulConnectionDetails({
  form,
}: ISuccessfulConnectionDetails) {

  const [chartData, setChartData] = React.useState([])

  const createPackets = api.packet.createDynamicRecord.useMutation()
  const {
    data: record = { data: [{
      id: '',
      timestamp: '',
    }] },
    refetch: fetchBandWidth,

  } = api.packet.getBandwithPerSecond.useQuery({
    code:'CV100006' ,
    time_range:getLastMinutesTimeStamp(3),
    bucket_size: '1s'

  })
 



  useEffect(() => {
    // This is a temporary solution to simulate the connection establishment

    const interval = setInterval(async () => {
      const a = await createPackets.mutateAsync({ entity: 'packets',
        data: {}})

        
      return true
    }, 2000)

    const isnterval = setInterval(async () => {
      const { data } = await fetchBandWidth()
      if(!data) return
      setChartData(data as any)

    }, 1000)


    return () => clearInterval(interval)
  }, [])

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

            <AreaChartSample chartData={chartData}/>
          </div>
        )
      }}
    />
  )
}
