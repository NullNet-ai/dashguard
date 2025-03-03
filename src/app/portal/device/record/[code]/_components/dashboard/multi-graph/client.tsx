'use client'

import React, { useEffect, useMemo } from 'react'

import { getLastMinutesTimeStamp, getLastSecondsTimeStamp, getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
} from '~/components/ui/chart'
import { api } from '~/trpc/react'

import { renderChart } from './function/renderChart'
import moment from 'moment-timezone'
import { IFormProps } from '../types'
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule'
import { useForm } from 'react-hook-form'
import { Form } from '~/components/ui/form'
import { z } from 'zod'
import FormClientFetch from '../pie-chart/client-fetch'


const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const InteractiveGraph = ({ defaultValues, multiSelectOptions }: IFormProps) => {
  const [interfaces, setInterfaces] = React.useState<string[]>([])
  const [packetsIP, setPacketsIP] = React.useState<any[]>([])
  const form = useForm({
    defaultValues: {
      graph_type: 'default',
      interfaces: multiSelectOptions
    }
  })


  const chartConfig = useMemo(() => {
    if (!interfaces?.length) return null

    return interfaces.reduce((config, key) => {
      const option = interfaces.find(option => {
        return option.value === key?.value
      });
      if (option) {
        config[key?.value] = {
          label: option.label,
          color: `hsl(var(--chart-${interfaces.findIndex(opt => opt?.value === key?.value) + 1}))`,
        };
      }
      return config;
    }, {} as Record<string, { label: string; color: string }>)
  }, [interfaces]);

  console.log("%c Line:52 🥕 chartConfig", "color:#e41a6a", chartConfig);

  const { refetch: fetchBandWidth } = api.packet.getBandwithInterfacePerSecond.useQuery(
    {

      bucket_size: '1s',
      timezone: timezone,
      device_id: defaultValues?.id,
      time_range: getLastTimeStamp(20, 'second', new Date()),
      interface_names: interfaces?.map((item: any) => item?.value),
    })

  console.log("%c Line:69 🥟 packetsIP", "color:#33a5ff", packetsIP);
  const filteredData = packetsIP?.map((item) => {
    const date = moment(item.bucket).tz(timezone)
    return {
      ...item,
      bucket: date.format('HH:mm:ss')
    }
  })

  const fetchChartData = async () => {
    const { data } = await fetchBandWidth();
    console.log('%c Line:74 🍪 data', 'color:#4fff4B', data);
    setPacketsIP(data as any)

  };

  useEffect(() => {

    fetchChartData()
    const interval = setInterval(() => {

      console.log('%c Line:74 🍊', 'color:#ed9ec7');
      fetchChartData()
    }, 2000)
    return () => clearInterval(interval)
  }, [interfaces, defaultValues?.id, defaultValues?.device_status])

  return (

      <div className='px-4'>
        <Form {...form}>
          <div className='pt-2 grid !grid-cols-6 gap-4'>
            <FormModule
              myParent='record'
              form={form}
              formKey='AreaChart'
              formSchema={z.object({})}
              subConfig={{
                multiSelectOptions: {
                  interfaces: multiSelectOptions ?? []
                },
                selectOptions: {
                  graph_type: [
                    { label: 'Default', value: 'default' },
                    { label: 'Bar Chart', value: 'bar' },
                    { label: 'Line Chart', value: 'line' },
                  ]
                }
              }}
              fields={[
                {
                  "id": "space",
                  "formType": "space",
                  "name": "space",
                  "label": "Space",
                  "description": "Field Description",
                  "placeholder": "Enter value...",
                  "fieldClassName": "",
                  "fieldStyle": {
                    "gridColumn": "1 / span 2",
                    "gridRow": "1 / span 1"
                  }
                },
                {
                  "id": "interfaces",
                  "formType": "multi-select",
                  "name": "interfaces",
                  "label": "Interfaces",
                  "description": "Field Description",
                  "placeholder": "Enter value...",
                  "fieldClassName": "",
                  "fieldStyle": {
                    "gridColumn": "3 / span 2",
                    "gridRow": "1 / span 1"
                  }
                },
                {
                  "id": "graph_type",
                  "formType": "select",
                  "name": "graph_type",
                  "label": "Graph Type",
                  "description": "Field Description",
                  "placeholder": "Enter value...",
                  "fieldClassName": "",
                  "fieldStyle": {
                    "gridColumn": "5 / span 2",
                    "gridRow": "1 / span 1"
                  }
                },
                {
                  "id": "pie_chart",
                  "formType": "custom-field",
                  "name": "pie_chart",
                  "label": "Pie Chart",
                  "description": "Field Description",
                  "placeholder": "Enter value...",
                  "fieldClassName": "",
                  "fieldStyle": {
                    "gridColumn": "1 / span 2",
                    "gridRow": "2 / span 2"
                  },
                  render: () => {
                    return <Card>
                      <CardHeader className='flex items-left justify-center pt-4'>
                        <CardTitle className='text-md text-default/90'>Pie Chart</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormClientFetch />
                      </CardContent>
                    </Card>
                  },
                },
                {
                  "id": "graph",
                  "formType": "custom-field",
                  "name": "graph",
                  "label": "Graph",
                  "description": "Field Description",
                  "placeholder": "Enter value...",
                  "fieldClassName": "",
                  "fieldStyle": {
                    "gridColumn": "3 / span 4",
                    "gridRow": "2 / span 1"
                  },
                  render: ({ form }) => {
                    const interfacesData = form?.watch('interfaces')

                    setInterfaces(interfacesData)
                    const graphType = form?.watch('graph_type')
                    return <Card className='max-h-[362px]'><ChartContainer
                      className="h-full w-full p-5"
                      config={chartConfig}
                    >
                      {renderChart({ filteredData, graphType, interfaces: interfacesData })}

                    </ChartContainer></Card>
                  },
                },
                // {
                //   "id": "tabs",
                //   "formType": "space",
                //   "name": "tabs",
                //   "label": "Tabs",
                //   "description": "Field Description",
                //   "placeholder": "Enter value...",
                //   "fieldClassName": "",
                //   "fieldStyle": {
                //     "gridColumn": "1 / span 6",
                //     "gridRow": "4 / span 1"
                //   }
                // },
                // {
                //   "id": "new_graph",
                //   "formType": "space",
                //   "name": "new_graph",
                //   "label": "New Graph",
                //   "description": "Field Description",
                //   "placeholder": "Enter value...",
                //   "fieldClassName": "",
                //   "fieldStyle": {
                //     "gridColumn": "1 / span 6",
                //     "gridRow": "5 / span 1"
                //   }
                // }

              ]}

            />
          </div>
        </Form>
      </div>


  )
}

export default InteractiveGraph
