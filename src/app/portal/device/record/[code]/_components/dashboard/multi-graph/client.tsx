'use client'

import moment from 'moment-timezone'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { type IDropdown } from '~/app/portal/contact/_components/forms/category-details/types'
import {
  getLastTimeStamp,
} from '~/app/portal/device/utils/timeRange'
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule'
import { Card } from '~/components/ui/card'
import { ChartContainer } from '~/components/ui/chart'
import { Form } from '~/components/ui/form'
import { api } from '~/trpc/react'

import FormClientFetch from '../pie-chart/client-fetch'
import { type IFormProps } from '../types'

import { renderChart } from './function/renderChart'
import { useSocketConnection } from '../custom-hooks/useSocketConnection';
import { updateNetworkBuckets } from './function/updateNetworkBucket';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const channel_name = 'packets_interfaces'

const InteractiveGraph = ({
  defaultValues,
  multiSelectOptions,
}: IFormProps) => {

  const [interfaces, setInterfaces] = React.useState<IDropdown[]>([])
  const [packetsIP, setPacketsIP] = React.useState<any[]>([])
  const [filteredData, setFilteredData] = React.useState<any[]>([])
  const [token, setToken] = React.useState<string | null>(null)

  const {socket} = useSocketConnection({channel_name, token})
  const getAccount = api.organizationAccount.getAccountID.useMutation();
  const getChartData = api.packet.getBandwithInterfacePerSecond.useMutation();
  
  const form = useForm({
    defaultValues: {
      graph_type: 'area',
      interfaces: multiSelectOptions,
      pie_chart_interfaces: multiSelectOptions,
    },
  })
  

  
  
  const [org_acc_id, setOrgAccountID] = React.useState<string | null>(null)
  
  const _pie_chart_interfaces = form.watch('pie_chart_interfaces') ?? []
  const chartConfig = useMemo(() => {
    if (!interfaces?.length) return null

    return interfaces.reduce(
      (config, key) => {
        const option = interfaces.find((option) => {
          return option.value === key?.value
        })
        if (option) {
          config[key?.value] = {
            label: option.label,
            color: `hsl(var(--chart-${interfaces.findIndex(opt => opt?.value === key?.value) + 1}))`,
          }
        }
        return config
      }, {} as Record<string, { label: string, color: string }>,
    )
  }, [interfaces])

  const fetchBandWidth = async () => {
    const res = await getChartData.mutateAsync({
      bucket_size: '1s',
      timezone,
      device_id: defaultValues?.id,
      time_range: getLastTimeStamp({count: 2, unit: 'minute', _now: new Date()}) as string[],
      interface_names: interfaces?.map((item: any) => item?.value),
    })
    
    
    setPacketsIP((prev) => {
      const updatedData = [...prev, ...res].slice(-100) // Keep only last 100 records
      return updatedData
    })
  }

    useEffect(() => {
      if (!packetsIP) return
    
      const _data = packetsIP.map((item) => {
        const date = moment(item.bucket)
        return {
          ...item,
          bucket: date.format('HH:mm:ss'),
        }
      })
    
      setFilteredData((prev) => [..._data].slice(-100))
    }, [packetsIP])
    
    useEffect(() => {
      const _getAccount = async () => {
        const res = await getAccount.mutateAsync()
        console.log('%c Line:108 🥔 res', 'color:#42b983', res);
        const { account_id, token } = res || {}
        setOrgAccountID(account_id)
        setToken(token)
      }
      
      _getAccount()
      // Eviction: Keep only the last 100 records
      return () => {
        setPacketsIP([])
        setFilteredData([])
      }
    }, [])

    console.log('%c Line:122 🥓', 'color:#ea7e5c', {socket, org_acc_id});
    useEffect(() => {

      
      console.log('%c Line:126 🍧 socket', 'color:#ffdd4d', socket);
      console.log('%c Line:127 🍋 org_acc_id', 'color:#ea7e5c', org_acc_id);
      if (!socket || !org_acc_id) return

      console.log('%c Line:128 🍻', 'color:#2eafb0', `${channel_name}-${org_acc_id}`);
      socket.on( `${channel_name}-${org_acc_id}`, (data: Record<string,any>) => {
        
        console.log('%c Line:128 🍫', 'color:#f5ce50', `${channel_name}-${org_acc_id}`,'data:: ', data);
       const updated_filtered_data =  updateNetworkBuckets(filteredData, data?.packet)
       setFilteredData(updated_filtered_data)
      })
    },[socket, filteredData, org_acc_id])
    

  useEffect(() => {
    fetchBandWidth()
  }, [interfaces, defaultValues?.id, defaultValues?.device_status])

  useEffect(() => {
      fetchBandWidth()
  }, [])

  useEffect(() => {
    const interfacesData = form.watch('interfaces') || []
    setInterfaces(interfacesData as any)
  }, [form.watch('interfaces')])

  return (
    <div className="flex flex-row gap-4 px-4">
      <div className="w-[30%]">
        <Card className="px-4 min-h-[432px]">
          <div className='text-base py-2 pt-4'>
            <h3>Bandwidth per second</h3>
          </div>
          <Form {...form}>
            <div className="grid !grid-cols-4 gap-4 pt-2">
              <FormModule
                fields = { [
                  {
                    id: 'pie_chart_interfaces',
                    formType: 'multi-select',
                    name: 'pie_chart_interfaces',
                    label: 'Interfaces',
                    description: 'Field Description',
                    placeholder: '',
                    fieldClassName: 'relative z-[100]',
                    fieldStyle: {
                      gridColumn: '1 / span 4',
                      gridRow: '1 / span 1',
                    },
                  },
                  {
                    id: 'pie_chart',
                    formType: 'custom-field',
                    name: 'pie_chart',
                    label: 'Pie Chart',
                    description: 'Field Description',
                    placeholder: 'Enter value...',
                    fieldClassName: '',
                    fieldStyle: {
                      gridColumn: '1 / span 4',
                      gridRow: '2 / span 1',
                    },
                    render: () => {
                      return (
                        <div className='flex items-center justify-center mt-10'>
                          <FormClientFetch interfaces={_pie_chart_interfaces} />
                        </div>
                      )
                    },
                  },
                ] }
                form = { form as any }
                formKey = "PieChart"
                formSchema = { z.object({}) }
                myParent = "record"
                subConfig = { {
                  multiSelectOptions: {
                    pie_chart_interfaces: (multiSelectOptions ?? [] as any),
                  },
                } }
              />
            </div>
          </Form>
        </Card>
      </div>
      <div className="w-[70%]">
        <Card className="px-4">
          <div className='text-base py-2 pt-4'>
            {/* <h3>Chart Label</h3> */}
          </div>
          <Form {...form}>
            <div className="grid !grid-cols-4 gap-4 pt-2">
              <FormModule
                fields = { [
                  {
                    id: 'field_1741046129256',
                    formType: 'space',
                    name: 'field_1741046129256',
                    label: 'New Field 1',
                    description: 'Field Description',
                    placeholder: 'Enter value...',
                    fieldClassName: '',
                    fieldStyle: {
                      gridColumn: '1 / span 1',
                      gridRow: '1 / span 1',
                    },
                  },
                  {
                    id: 'interfaces',
                    formType: 'multi-select',
                    name: 'interfaces',
                    label: 'Interfaces',
                    description: 'Field Description',
                    placeholder: '',
                    fieldClassName: '',
                    fieldStyle: {
                      gridColumn: '2 / span 2',
                      gridRow: '1 / span 1',
                    },
                  },
                  {
                    id: 'graph_type',
                    formType: 'select',
                    name: 'graph_type',
                    label: 'Graph Type',
                    description: 'Field Description',
                    placeholder: '',
                    fieldClassName: '',
                    fieldStyle: {},
                  },
                  {
                    id: 'field_1741046122848',
                    formType: 'custom-field',
                    name: 'field_1741046122848',
                    label: 'New Field 5',
                    description: 'Field Description',
                    placeholder: 'Enter value...',
                    fieldClassName: '',
                    fieldStyle: {
                      gridColumn: '1 / span 4',
                      gridRow: '2 / span 1',
                    },
                    render: ({ form }) => {
                      const interfacesData = form?.watch('interfaces') || []
                      const graphType = form?.watch('graph_type')
                      return (
                        <div className = "max-h-[340px]">
                          <ChartContainer
                            className = "h-full w-full py-4"
                            config = { chartConfig as any }
                          >
                            {renderChart({
                              filteredData,
                              graphType,
                              interfaces: interfacesData,
                              // interfaces: [],
                            })}
                          </ChartContainer>
                        </div>
                      )
                    },
                  },
                ] }
                form = { form as any }
                formKey = "AreaChart"
                formSchema = { z.object({}) }
                myParent = "record"
                subConfig = { {
                  multiSelectOptions: {
                    interfaces: (multiSelectOptions ?? [] as any),
                  },
                  selectOptions: {
                    graph_type: [
                      { label: 'Area Chart', value: 'area' },
                      { label: 'Bar Chart', value: 'bar' },
                      { label: 'Line Chart', value: 'line' },
                    ],
                  },
                } }
              />
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default InteractiveGraph