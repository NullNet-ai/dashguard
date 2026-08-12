'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/components/ui/chart';

export interface MetricLine {
  dataKey: string;
  label: string;
  color: string;
}

interface MetricChartProps {
  data: Record<string, any>[];
  lines: MetricLine[];
  yDomain?: [number, number];
  valueFormatter?: (value: unknown) => string;
  xKey?: string;
  dynamicYAxis?: boolean;
}

const formatTick = (value: string) => {
  if (typeof value === 'string' && value.includes(':')) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const MetricChart = ({
  data,
  lines,
  yDomain,
  valueFormatter,
  xKey = 'timestamp',
  dynamicYAxis,
}: MetricChartProps) => {
  const config = lines.reduce<ChartConfig>((acc, line) => {
    acc[line.dataKey] = { label: line.label, color: line.color };
    return acc;
  }, {});

  const dynamicDomain = useMemo(() => {
    if (!dynamicYAxis) return undefined;
    const values = data.flatMap((row) =>
      lines
        .map((line) => Number(row[line.dataKey] ?? 0))
        .filter(Number.isFinite),
    );
    if (values.length === 0) return [0, 1];
    const max = Math.max(...values);
    if (max === 0) return [0, 1];
    return [0, Math.ceil(max * 1.25)];
  }, [data, lines, dynamicYAxis]);

  return (
    <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={formatTick}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            domain={
              dynamicYAxis && dynamicDomain
                ? dynamicDomain
                : (yDomain ?? ['auto', 'auto'])
            }
            tickFormatter={(value) =>
              valueFormatter ? valueFormatter(value) : String(value)
            }
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={(value) => formatTick(value as string)}
                valueFormatter={valueFormatter}
              />
            }
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              dataKey={line.dataKey}
              stroke={line.color}
              type="monotone"
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {lines.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MetricChart;
