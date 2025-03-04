"use client";

import React, {useEffect, useMemo} from 'react'

import {
  getLastMinutesTimeStamp,
  getLastSecondsTimeStamp,
  getLastTimeStamp,
} from "~/app/portal/device/utils/timeRange";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type ChartConfig, ChartContainer } from "~/components/ui/chart";
import { api } from "~/trpc/react";

import { renderChart } from "./function/renderChart";
import moment from "moment-timezone";
import { IFormProps } from "../types";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { useForm } from "react-hook-form";
import { Form } from "~/components/ui/form";
import { z } from "zod";
import FormClientFetch from "../pie-chart/client-fetch";
import { IDropdown } from "~/app/portal/contact/_components/forms/category-details/types";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const InteractiveGraph = ({
  defaultValues,
  multiSelectOptions,
}: IFormProps) => {
  const [interfaces, setInterfaces] = React.useState<IDropdown[]>([]);
  const [packetsIP, setPacketsIP] = React.useState<any[]>([]);
  const form = useForm({
    defaultValues: {
      graph_type: 'default',
      interfaces: multiSelectOptions,
      pie_chart_interfaces: multiSelectOptions,
    }
  })
  const [filteredData, setFilteredData] = React.useState<any[]>([])

  const _pie_chart_interfaces = form.watch("pie_chart_interfaces") ?? [];

  const chartConfig = useMemo(() => {
    if (!interfaces?.length) return null;

    return interfaces.reduce(
      (config, key) => {
        const option = interfaces.find((option) => {
          return option.value === key?.value;
        });
        if (option) {
          config[key?.value] = {
            label: option.label,
            color: `hsl(var(--chart-${interfaces.findIndex((opt) => opt?.value === key?.value) + 1}))`,
          };
        }
        return config;
      },
      {} as Record<string, { label: string; color: string }>,
    );
  }, [interfaces]);

  console.log("%c Line:52 🥕 chartConfig", "color:#e41a6a", chartConfig);

  const { refetch: fetchBandWidth } =
    api.packet.getBandwithInterfacePerSecond.useQuery({
      bucket_size: "1s",
      timezone: timezone,
      device_id: defaultValues?.id,
      time_range: getLastTimeStamp(20, "second", new Date()),
      interface_names: interfaces?.map((item: any) => item?.value),
    })
    
    
 useEffect(() => {
    if(!packetsIP) return
   const _data = packetsIP?.map((item) => {
      const date = moment(item.bucket).tz(timezone)
        return {
          ...item,
          bucket: date.format('HH:mm:ss')
        }
    })
   setFilteredData(_data)
  },[packetsIP])
  
  const fetchChartData = async () => {
    const { data } = await fetchBandWidth();

    setPacketsIP(data as any);
  };

  useEffect(() => {
    fetchChartData();
    const interval = setInterval(() => {
      fetchChartData()
    }, 2000)
    return () => clearInterval(interval)
  }, [interfaces, defaultValues?.id, defaultValues?.device_status])

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
                myParent="record"
                form={form}
                formKey="PieChart"
                formSchema={z.object({})}
                subConfig={{
                  multiSelectOptions: {
                    pie_chart_interfaces: multiSelectOptions ?? [],
                  },
                }}
                fields={[
                  {
                    id: "pie_chart_interfaces",
                    formType: "multi-select",
                    name: "pie_chart_interfaces",
                    label: "Interfaces",
                    description: "Field Description",
                    placeholder: "",
                    fieldClassName: "relative z-[100]",
                    fieldStyle: {
                      gridColumn: "1 / span 4",
                      gridRow: "1 / span 1",
                    },
                  },
                  {
                    id: "pie_chart",
                    formType: "custom-field",
                    name: "pie_chart",
                    label: "Pie Chart",
                    description: "Field Description",
                    placeholder: "Enter value...",
                    fieldClassName: "",
                    fieldStyle: {
                      gridColumn: "1 / span 4",
                      gridRow: "2 / span 1",
                    },
                    render: () => {
                      return <div className='flex items-center justify-center mt-10'>
                        <FormClientFetch interfaces={_pie_chart_interfaces} />
                      </div> ;
                    },
                  },
                ]}
              />
            </div>
          </Form>
        </Card>
      </div>
      <div className="w-[70%]">
        <Card className="px-4">
        <div className='text-base py-2 pt-4'>
          <h3>Chart Label</h3>
        </div>
          <Form {...form}>
            <div className="grid !grid-cols-4 gap-4 pt-2">
              <FormModule
                myParent="record"
                form={form}
                formKey="AreaChart"
                formSchema={z.object({})}
                subConfig={{
                  multiSelectOptions: {
                    interfaces: multiSelectOptions ?? [],
                  },
                  selectOptions: {
                    graph_type: [
                      { label: "Default", value: "default" },
                      { label: "Bar Chart", value: "bar" },
                      { label: "Line Chart", value: "line" },
                    ],
                  },
                }}
                fields={[
                  {
                    id: "field_1741046129256",
                    formType: "space",
                    name: "field_1741046129256",
                    label: "New Field 1",
                    description: "Field Description",
                    placeholder: "Enter value...",
                    fieldClassName: "",
                    fieldStyle: {
                      gridColumn: "1 / span 1",
                      gridRow: "1 / span 1",
                    },
                  },
                  {
                    id: "interfaces",
                    formType: "multi-select",
                    name: "interfaces",
                    label: "Interfaces",
                    description: "Field Description",
                    placeholder: "",
                    fieldClassName: "",
                    fieldStyle: {
                      gridColumn: "2 / span 2",
                      gridRow: "1 / span 1",
                    },
                  },
                  {
                    id: "graph_type",
                    formType: "select",
                    name: "graph_type",
                    label: "Graph Type",
                    description: "Field Description",
                    placeholder: "",
                    fieldClassName: "",
                    fieldStyle: {},
                  },
                  {
                    id: "field_1741046122848",
                    formType: "custom-field",
                    name: "field_1741046122848",
                    label: "New Field 5",
                    description: "Field Description",
                    placeholder: "Enter value...",
                    fieldClassName: "",
                    fieldStyle: {
                      gridColumn: "1 / span 4",
                      gridRow: "2 / span 1",
                    },
                    render: ({ form }) => {
                      const interfacesData = form?.watch("interfaces");

                      setInterfaces(interfacesData);
                      const graphType = form?.watch("graph_type");
                      return (
                        <div className="max-h-[340px]">
                          <ChartContainer
                            className="h-full w-full py-4"
                            config={chartConfig}
                          >
                            {renderChart({
                              filteredData,
                              graphType,
                              interfaces: interfacesData,
                            })}
                          </ChartContainer>
                        </div>
                      );
                    },
                  },
                ]}
              />
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveGraph;
