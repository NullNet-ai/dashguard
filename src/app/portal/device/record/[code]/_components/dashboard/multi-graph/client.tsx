'use client'

import * as React from 'react'

import { getLastMinutesTimeStamp, getLastTimeStamp, getUnit } from '~/app/portal/device/utils/timeRange'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { api } from '~/trpc/react'

import { renderChart } from './function/renderChart'
import moment from 'moment-timezone'
import { IFormProps } from '../types'
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule'
import { useForm } from 'react-hook-form'
import { Form } from '~/components/ui/form'
import { z } from 'zod'
import FormClientFetch from '../pie-chart/client-fetch'


const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  static_bandwidth: {
    label: 'Static Bandwidth',
    color: 'hsl(var(--chart-1))',
  },
  bandwidth: {
    label: 'Bandwidth',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const InteractiveGraph = ({ multiSelectOptions }: IFormProps) => {
  const [interfaces, setInterfaces] = React.useState<string[]>([])
  const form = useForm({
    defaultValues: {
      graph_type: 'default',
      interfaces: multiSelectOptions
    }
  })
  console.log("%c Line:53 🥤 interfaces", "color:#93c0a4", interfaces);
  // const [graphType, setGraphType] = React.useState('default')

  // const cardTitle = React.useMemo(() => {
  //   return graphType === 'bar' ? 'Bar Chart' : graphType === 'line' ? 'Line Chart' : 'Area Chart'
  // }, [graphType])


  const { data: packetsIP = [], refetch } = api.packet.getBandwidthInterfacePerSecond.useQuery(
    {
      bucket_size: '1s',
      timeRange: getLastMinutesTimeStamp(3),
      interface_name: interfaces?.map((item: any) => item?.value),
    })

  const filteredData = packetsIP?.map((item) => {
    const date = moment(item.bucket).tz(timezone)
      return {
        ...item,
        static_bandwidth: !item.bandwidth ? 0 : Number(item.bandwidth) + 100000000,
        bucket: date.format('HH:mm:ss')
      }
  })

 

  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 1000)
    return () => clearInterval(interval)
    // Cleanup on unmount or resolution change
  }
    , [interfaces])

  return (
    <Card>
      <div className='px-4'>
      <Form {...form}>
        <div className='pt-2 grid !grid-cols-8 gap-4'>
          <FormModule
            // customDesign={{
            //   formClassName: 'grid !grid-cols-2 gap-4',
            // }}
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
                    {renderChart({ filteredData, graphType })}

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
