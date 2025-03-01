'use client'

import React, {useEffect} from 'react'

import {getLastMinutesTimeStamp, getLastSecondsTimeStamp, getLastTimeStamp } from '~/app/portal/device/utils/timeRange'
import {
  Card,
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

const InteractiveGraph = ({defaultValues, multiSelectOptions }: IFormProps) => {
  const [interfaces, setInterfaces] = React.useState<string[]>([])
  const [packetsIP, setPacketsIP] = React.useState<any[]>([])
  const form = useForm({
    defaultValues: {
      graph_type: 'default',
      interfaces: multiSelectOptions
    }
  })


  const chartConfig = interfaces.reduce((config, key) => {
    console.log("%c Line:52 🥤 key", "color:#7f2b82", key);
    const option = interfaces.find(option => {
      return option.value === key?.value});
    if (option) {
      config[key?.value] = {
        label: option.label,
        color: `hsl(var(--chart-${interfaces.findIndex(opt => opt?.value === key?.value) + 1}))`,
      };
    }
    return config;
  }, {} as Record<string, { label: string; color: string }>);
  
  console.log("%c Line:52 🥕 chartConfig", "color:#e41a6a", chartConfig);

  const { refetch: fetchBandWidth } = api.packet.getBandwithInterfacePerSecond.useQuery(
    {
      
      bucket_size: '1s',
      timezone: timezone,
      device_id: defaultValues?.id,
      time_range:  getLastTimeStamp(20,'second', new Date()),
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
    <Card>
      <div className='px-4'>
      <Form {...form}>
        <div className='pt-2 grid !grid-cols-8 gap-4'>
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
                "id": "pie_chart",
                "formType": "custom-field",
                "name": "pie_chart",
                "label": "Pie Chart",
                "description": "Field Description",
                "placeholder": "Enter value...",
                "fieldClassName": "",
                "fieldStyle": {
                  "gridColumn": "1 / span 4",
                  "gridRow": "1 / span 1"
                },
                render: () => {
                  return <div className='ml-20 mt-10'>Pie Chart</div>
                },
              },
              {
                "id": "interfaces",
                "formType": "multi-select",
                "name": "interfaces",
                "label": "Interfaces",
                "description": "Field Description",
                "placeholder": "",
                "fieldClassName": "",
                "fieldStyle": {
                  "gridColumn": "5 / span 2",
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
                  "gridColumn": "7 / span 2",
                  "gridRow": "1 / span 1"
                }
              },
              {
                id: "field_1740796359046",
                formType: "custom-field",
                name: "field_1740796359046",
                label: "New Field 7",
                description: "Field Description",
                placeholder: "Enter value...",
                fieldClassName: "",
                fieldStyle: {
                  gridColumn: "1 / span 2",
                  gridRow: "2 / span 2"
                },
                render: () => {
                  return <FormClientFetch />
                },
              },
              {
                id: "field_1740796360366",
                formType: "custom-field",
                name: "field_1740796360366",
                label: "New Field 9",
                description: "Field Description",
                placeholder: "Enter value...",
                fieldClassName: "",
                fieldStyle: {
                  gridColumn: "3 / span 6",
                  gridRow: "2 / span 4"
                },
                render: ({ form }) => {
                  const interfacesData = form?.watch('interfaces')

                  setInterfaces(interfacesData)
                  const graphType = form?.watch('graph_type')
                    return <div className='px-2 pt-4 sm:px-6 sm:pt-6'><ChartContainer
                    className="h-full w-full p-5"
                    config={chartConfig}
                  >
                    {renderChart({ filteredData, graphType, interfaces: interfacesData})}

                  </ChartContainer></div>
                },
              },
              {
                "id": "tabs",
                "formType": "space",
                "name": "tabs",
                "label": "Tabs",
                "description": "Field Description",
                "placeholder": "Enter value...",
                "fieldClassName": "",
                "fieldStyle": {
                  "gridColumn": "1 / span 8",
                  "gridRow": "3 / span 1"
                }
              },
              {
                "id": "graphs",
                "formType": "space",
                "name": "graphs",
                "label": "Graphs",
                "description": "Field Description",
                "placeholder": "Enter value...",
                "fieldClassName": "",
                "fieldStyle": {
                  "gridColumn": "1 / span 8",
                  "gridRow": "4 / span 1"
                },
              }

            ]}

          />
        </div>
      </Form>
      </div>

    </Card>
  )
}

export default InteractiveGraph
