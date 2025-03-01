'use client'

import * as React from 'react'

import { getLastTimeStamp, getUnit } from '~/app/portal/device/utils/timeRange'
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

const InteractiveGraph = ({ defaultValues }: IFormProps) => {
  const [interfaces, setInterfaces] = React.useState<string[]>()
  const form = useForm({
    defaultValues: {
      graph_type: 'default',
      interfaces: [
        { label: 'wan (vtnet0)', value: 'wan (vtnet0)' },
        { label: 'lan (vtnet1)', value: 'lan (vtnet1)' },
      ]
    }
  })
  // const [graphType, setGraphType] = React.useState('default')

  // const cardTitle = React.useMemo(() => {
  //   return graphType === 'bar' ? 'Bar Chart' : graphType === 'line' ? 'Line Chart' : 'Area Chart'
  // }, [graphType])


  console.log("%c Line:110 🍯 time_range", "color:#ea7e5c", moment().format('YYYY-MM-DD'),);

  const { data: packetsIP = [], refetch } = api.packet.getBandwith.useQuery(
    {
      bucket_size: '1s',
      time_range: moment().format('YYYY-MM-DD'),
      timezone,
    })

  const filteredData = packetsIP?.map((item) => {
    const date = moment(item.bucket)
    if (timeRange === '1d') {
      return {
        ...item,
        bucket: date.format('HH:mm:ss')
      }
    }
    return { ...item, bucket: date.format('MM/DD') }
  })

  const add_static_bandwidth = filteredData?.map((item) => {
    return {
      ...item,
      // static_bandwidth: !item.bandwidth ? 0 : Number(item.bandwidth) + 100000000,
    }
  }
  )

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
      {/* <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{`${cardTitle} - Interactive`}</CardTitle>
        </div>
        Interfaces
        <Select value={interfaces} onValueChange={setInterfaces}>
          <SelectTrigger
            aria-label="Select a value"
            className="w-[160px] rounded-lg sm:ml-auto"
          >
            <SelectValue placeholder="Select Interfaces" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {resolutionOpt.map((options: any) => Object.entries(options).map(([key, label]) => (
              <SelectItem className="rounded-lg" key={key} value={key}>
                {label as string}
              </SelectItem>
            ))
            )}
          </SelectContent>
        </Select>
        Graph Type
        <Select value={graphType} onValueChange={setGraphType}>
          <SelectTrigger
            aria-label="Select a value"
            className="w-[160px] rounded-lg sm:ml-auto"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem className="rounded-lg" value="default">
              Default
            </SelectItem>
            <SelectItem className="rounded-lg" value="bar">
              Bar Chart
            </SelectItem>
            <SelectItem className="rounded-lg" value="line">
              Line Chart
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-full w-full p-5"
          config={chartConfig}
        >
          {renderChart({ filteredData: add_static_bandwidth, graphType })}

        </ChartContainer>
      </CardContent> */}


      <Form {...form}>
        <div className='grid !grid-cols-6 gap-4'>
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
                interfaces: [
                  { label: 'wan (vtnet0)', value: 'wan (vtnet0)' },
                  { label: 'lan (vtnet1)', value: 'lan (vtnet1)' },
                  { label: 'lan (vtnet2)', value: 'lan (vtnet2)' },
                  { label: 'lan (vtnet3)', value: 'lan (vtnet3)' },
                ]
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
                id: "field_1740796330359",
                formType: "space",
                name: "field_1740796330359",
                label: "New Field 1",
                description: "Field Description",
                placeholder: "Enter value...",
                fieldClassName: "",
                fieldStyle: {
                  gridColumn: "1 / span 4",
                  gridRow: "1 / span 1"
                }
              },
              {
                id: "interfaces",
                formType: "multi-select",
                name: "interfaces",
                label: "Interfaces",
                description: "Field Description",
                placeholder: "Enter value...",
                fieldClassName: "",
                fieldStyle: {},
              },
              {
                id: "graph_type",
                formType: "select",
                name: "graph_type",
                label: "Graph Type",
                description: "Field Description",
                placeholder: "Enter value...",
                fieldClassName: "",
                fieldStyle: {}
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
                render: ({ field, fieldConfig, fieldState }) => {
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
                  gridColumn: "3 / span 4",
                  gridRow: "2 / span 2"
                },
                render: ({ form, field, fieldConfig, fieldState }) => {
                  const interfacesData = form?.watch('interfaces')

                  setInterfaces(interfacesData)
                  const graphType = form?.watch('graph_type')
                  // px-2 pt-4 sm:px-6 sm:pt-6
                  return <div className='px-2 pt-4 sm:px-6 sm:pt-6'><ChartContainer
                    className="aspect-auto h-full w-full p-5"
                    config={chartConfig}
                  >
                    {renderChart({ filteredData: add_static_bandwidth, graphType })}

                  </ChartContainer></div>
                },
              }

            ]}

          />
        </div>
      </Form>

    </Card>
  )
}

export default InteractiveGraph
