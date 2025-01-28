"use client";

import { capitalize } from "lodash";
import React, { useMemo } from "react";
import { Pie, PieChart, Tooltip } from "recharts";

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
  renderCustomPieChartLabel?: React.FC<any>;
  renderCustomPieChartTooltip?: React.FC<any>;
  entity: string;
  items: {
    key: string;
    label: string;
    value: number;
    color: string;
  }[];
}

const FormPieChart = (props: IFormPieChartProps) => {
  const {
    entity,
    items,
    renderCustomPieChartLabel,
    renderCustomPieChartTooltip,
  } = props;

  const chartConfig: ChartConfig = items.reduce((acc, curr) => {
    const { key, label, color } = curr;
    return {
      ...acc,
      [key]: {
        label,
        color,
      },
    };
  }, {});

  const chartData = items.map((e) => {
    const { key, value } = e;
    return {
      key,
      value,
      fill: `var(--color-${key})`,
    };
  });

  const totalRecordsCount = useMemo(() => {
    return items.reduce((acc, curr) => {
      return acc + curr.value;
    }, 0);
  }, [items.length]);

  return (
    <div className="p-4 shadow-md">
      <CardHeader className="items-center pb-0">
        <CardTitle>{capitalize(entity)}</CardTitle>
        <CardDescription>{`Total Records: ${totalRecordsCount}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
          <Tooltip
              {...(renderCustomPieChartTooltip && {
                content: (props) => {
                  return renderCustomPieChartTooltip({...props, totalRecordsCount});
                },
              })}
            />
            <Pie
              data={chartData}
              dataKey="value"
              label={renderCustomPieChartLabel ?? true}
              nameKey="key"
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="key" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
};

export default FormPieChart;
