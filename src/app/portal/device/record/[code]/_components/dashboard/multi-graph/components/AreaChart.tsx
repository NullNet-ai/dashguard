import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart';
import { formatNumber, modifyAxis } from './LineChart';
import { getInterfaceColor, sortInterface } from './graph-color';
import { formatBytes } from '../../pie-chart/function/formatBytes'

const AreaChartComponent = ({ filteredData, interfaces }: any) => {
  const formatTooltipValue = (value: unknown, item: any) => {
    const { payload, dataKey } = item
    const packet = payload[`${dataKey}_packet`]
    const numericValue = typeof value === 'number' ? value : Number(value)
    return `${Number.isFinite(numericValue) ? formatBytes(numericValue) : String(value ?? '')} (${packet} Packet${packet > 1 ? 's' : ''})`
  }
  const sorted = sortInterface(interfaces);
  const { yAxisMax, yAxisMin } = modifyAxis(filteredData);

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
      <AreaChart
        data={filteredData}
        height={300}
        width={1870}
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }} // Increased margin to prevent cutting
      >
        <defs>
          {sorted?.map((item: any) => {
            const color = getInterfaceColor(item?.value, item?.value1);
            return (
              <linearGradient key={item.value} id={item?.value} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            );
          })}
        </defs>
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
          padding={{ left: 20, right: 20 }} // Increased padding to prevent cutting
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
          cursor={{ stroke: '#ccc', strokeWidth: 1 }} // Add a custom cursor for better visibility
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
            zIndex: 1000, // Ensure the tooltip is above other elements
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Add a background for better readability
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        />
        {sorted?.map((item: any, index: number) => {
          return (
            <Area
              key={item.value}
              dataKey={item?.value}
              stroke={getInterfaceColor(item?.value, item?.value1)}
              fill={`url(#${item?.value})`}
              type="monotone" // Use "monotone" to ensure smooth curves
              isAnimationActive={false}
            />
          );
        })}
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;
