'use client'

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { getInterfaceColor } from './graph-color';
import { formatBytes as formatBytesTooltip } from '../../pie-chart/function/formatBytes'

export const modifyAxis = (data: any[]) => {
  const numericValues = (data ?? [])
    .flatMap((d) => Object.values(d).filter((v) => typeof v === 'number'))
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))

  if (numericValues.length === 0) {
    return { yAxisMax: 0, yAxisMin: 0 };
  }

  const minValue = Math.min(...numericValues)
  const maxValue = Math.max(...numericValues)

  const range = maxValue - minValue
  const padding = range === 0 ? maxValue * 0.25 : range * 0.25

  const yAxisMax = Math.ceil(maxValue + padding)
  const yAxisMin = Math.floor(Math.max(0, minValue - padding))

  return { yAxisMax, yAxisMin };
};

function formatBytes(bytes: any, decimals = 1) {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export const formatNumber = (num: number) => {
  return formatBytes(+num);
};

const LineChartComponent = ({ filteredData, interfaces }: any) => {
  const formatTooltipValue = (value: unknown, item: any) => {
    const { payload, dataKey } = item
    const packet = payload[`${dataKey}_packet`]
    const numericValue = typeof value === 'number' ? value : Number(value)
    return `${Number.isFinite(numericValue)
      ? formatBytesTooltip(numericValue)
      : String(value ?? '')} (${packet} Packet${packet > 1 ? 's' : ''})`
  }
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData || []), [filteredData]);

  const number_of_ticks = useMemo(() => {
    return yAxisMax >= 100000 ? 10 : 5;
  }, [yAxisMax]);

  const yDomain = useMemo(() => {
    if (yAxisMax == null || yAxisMin == null) return ['auto', 'auto'];
    if (yAxisMax === 0 && yAxisMin === 0) return [0, 1];
    return [yAxisMin, yAxisMax];
  }, [yAxisMin, yAxisMax]);

  const yticks = useMemo(() => {
    if (yAxisMax == null || yAxisMin == null) return [];
    if (yAxisMax === 0 && yAxisMin === 0) return [0];
    const ticks = [yAxisMin]; // Start from yAxisMin
    for (let i = 1; i < number_of_ticks; i++) {
      ticks.push(Math.round(yAxisMin + i * ((yAxisMax - yAxisMin) / (number_of_ticks - 1))));
    }
    return ticks;
  }, [yAxisMin, yAxisMax, number_of_ticks]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={filteredData}
        height={300}
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="bucket"
          tickFormatter={(value) => {
            const date = new Date(value);
            if (value.includes(':')) {
              return value; // Display time directly if it includes ':'
            }
            return date.toLocaleTimeString('en-US', {
              minute: '2-digit', // Display only the minutes
            });
          }}
          tickLine={false}
          tickMargin={3}
          tickCount={4}
          interval="preserveStartEnd"
          minTickGap={150}
          padding={{ left: 20, right: 20 }}
        />
        <YAxis
          allowDataOverflow={true}
          axisLine={false}
          domain={yDomain}
          tickCount={number_of_ticks}
          tickFormatter={(value) => formatNumber(value)} // Format all values dynamically
          tickLine={false}
          tickMargin={8}
          ticks={yticks} // Dynamically generated ticks
          includeHidden={true}
          minTickGap={0}
          allowDecimals={false}
          scale="linear"
        />
        <ChartTooltip
          cursor={{ stroke: '#ccc', strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              indicator="dot"
              valueFormatter={formatTooltipValue}
              labelFormatter={(value) => {
                if (value.includes(':')) {
                  return value; // Display time directly if it includes ':'
                }
                return new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
          }
          wrapperStyle={{
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        />
        {interfaces?.map((item: any) => (
          <Line
            key={item.value}
            dataKey={item.value}
            stroke={getInterfaceColor(item.value, item.value1)}
            dot={false}
            type="monotone"
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
