'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import {
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { formatNumber, modifyAxis } from './LineChart';
import { useMemo } from 'react';
import { getInterfaceColor } from './graph-color';
import { formatBytes } from '../../pie-chart/function/formatBytes'

const BarChartComponent = ({ filteredData, interfaces }: { filteredData: Record<string, any>[], interfaces: any }) => {
  const formatTooltipValue = (value: unknown, item: any) => {
    const { payload, dataKey } = item;
    const packet = payload[`${dataKey}_packet`];
    const originalValue = payload[`${dataKey}_original`] ?? value;
    const numericValue =
      typeof originalValue === 'number' ? originalValue : Number(originalValue);
    return `${Number.isFinite(numericValue) ? formatBytes(numericValue) : String(originalValue ?? '')} (${packet} Packet${packet > 1 ? 's' : ''})`;
  };
  const { yAxisMax, yAxisMin } = useMemo(
    () => modifyAxis(filteredData),
    [filteredData],
  );

  const number_of_ticks = 4; // Fixed to 4 ticks for Y-axis

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
      <BarChart
        data={filteredData.map((e: Record<string, any>) => {
          const [, firstTick] = yticks;
          if (!firstTick) return e;
          const transformed: Record<string, any> = { ...e };
          interfaces?.forEach((item: any) => {
            const key = item.value;
            const original = e[key];
            transformed[`${key}_original`] = original;
            if (original !== 0 && original < firstTick) {
              transformed[key] = firstTick * 0.2 - original * 0.2;
            }
          });
          return transformed;
        })}
        height={300}
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }} // Adjusted margin for better spacing
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
              hour: '2-digit', // Display only the hour
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
              labelFormatter={(value, payload) => {
                const total = payload?.reduce((sum, entry) => {
                  const num = typeof entry.value === 'number' ? entry.value : Number(entry.value)
                  return sum + (Number.isFinite(num) ? num : 0)
                }, 0) ?? 0

                const highest = payload?.reduce<{ num: number; key: string } | null>((max, entry) => {
                  const num = typeof entry.value === 'number' ? entry.value : Number(entry.value)
                  if (!Number.isFinite(num)) return max
                  return !max || num > max.num ? { num, key: String(entry.dataKey) } : max
                }, null)

                const label = value.includes(':')
                  ? value
                  : new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                const highestStr = highest ? ` | Top: ${highest.key} (${formatBytes(highest.num)})` : ''
                return `${label} — Total: ${formatBytes(total)}${highestStr}`
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
          <Bar
            key={item.value}
            dataKey={item.value}
            fill={getInterfaceColor(item.value, item.value1)}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
