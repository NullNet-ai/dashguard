'use client'

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import {
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { graphColors } from './graph-color';

export const modifyAxis = (data: any[]) => {
  const yAxisMax = Math.max(...data.map((d) => Math.max(...Object.values(d).filter((v) => typeof v === 'number'))));
  const yAxisMin = Math.min(...data.map((d) => Math.min(...Object.values(d).filter((v) => typeof v === 'number'))));
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
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData || []), [filteredData]);

  const number_of_ticks = useMemo(() => {
    return yAxisMax >= 100000 ? 10 : 5;
  }, [yAxisMax]);

  const yticks = useMemo(() => {
    if (!yAxisMax || !yAxisMin) return [];
    const ticks = [yAxisMin]; // Start from yAxisMin
    for (let i = 1; i < number_of_ticks; i++) {
      ticks.push(Math.round(yAxisMin + i * ((yAxisMax - yAxisMin) / (number_of_ticks - 1))));
    }
    return ticks;
  }, [yAxisMin, yAxisMax, number_of_ticks]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        accessibilityLayer={true}
        data={filteredData}
        height={300}
        width={1870}
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
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
          }}
          tickLine={false}
          tickMargin={8}
          tickCount={4} // Ensure only four ticks are displayed
          interval="preserveStartEnd" // Ensure ticks are evenly distributed
          minTickGap={150} // Add spacing between ticks
        />
        <YAxis
          allowDataOverflow={true}
          axisLine={false}
          domain={[yAxisMin || 'auto', yAxisMax || 'auto']} // Dynamically adjust the domain
          tickCount={number_of_ticks}
          tickFormatter={formatNumber} // Format all values dynamically
          tickLine={false}
          tickMargin={8}
          ticks={yticks} // Dynamically generated ticks
          includeHidden={true}
          minTickGap={0}
          allowDecimals={false}
          scale="linear"
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        {interfaces?.map((item: any) => {
          return (
            <Line
              key={item?.value}
              dataKey={item?.value}
              dot={false}
              stroke={graphColors[item?.value] ? graphColors[item?.value] : '#16a34a'}
              type="monotone"
              isAnimationActive={false} // Disable animation for smooth effect
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;