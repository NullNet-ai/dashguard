"use client"

import { capitalize } from "lodash";
import React from "react";
import { Pie, PieChart } from "recharts";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "~/components/ui/chart";

interface IFormPieChartProps {
  renderCustomPieChartLabel: React.FC<any>;
  entity: string;
  items: {
    key: string
    label: string
    value: number
    color: string
  }[]
}

const FormPieChart = (props: IFormPieChartProps) => {

    const { entity, items, renderCustomPieChartLabel } = props

    const chartConfig: ChartConfig = items.reduce((acc, curr) => {
        const {
            key,
            label,
            color,
        } = curr
        return {
            ...acc,
            [key]: {
                label,
                color,
            }
        }
    }, {})

    const chartData = items.map(e => {
        const { key, value } = e
        return {
            key,
            value,
            fill: `var(--color-${key})`,
        }
    })
    
    return (
        <div className="shadow-md p-4">
          <CardHeader className="items-center pb-0">
            <CardTitle>{capitalize(entity)}</CardTitle>
            <CardDescription>{`Total Records: ${items.reduce((acc, curr) => {
                return acc + curr.value
            }, 0)}`}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <Pie data={chartData} dataKey="value" label={renderCustomPieChartLabel ?? true} nameKey="key" />
                <ChartLegend
                  content={<ChartLegendContent nameKey="key" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          </div>
      )
};

export default FormPieChart;
