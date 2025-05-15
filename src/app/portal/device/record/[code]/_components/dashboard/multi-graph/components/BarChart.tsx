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
import { graphColors } from './graph-color';

const BarChartComponent = ({ filteredData, interfaces }: { filteredData: Record<string, any>[], interfaces: any }) => {
  
  const { yAxisMax, yAxisMin } = useMemo(() => modifyAxis(filteredData), [filteredData]);

  const number_of_ticks = 4; // Fixed to 4 ticks for Y-axis

  const yticks = useMemo(() => {
    if (!yAxisMax || !yAxisMin) return [];
    const ticks = [yAxisMin]; // Start from yAxisMin
    for (let i = 1; i < number_of_ticks; i++) {
      ticks.push(Math.round(yAxisMin + i * ((yAxisMax - yAxisMin) / (number_of_ticks - 1))));
    }
    return ticks;
  }, [yAxisMin, yAxisMax]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={filteredData}
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
          tickMargin={8}
          tickCount={4} // Ensure only 4 ticks are displayed
          interval="preserveStartEnd" // Ensure ticks are evenly distributed
          minTickGap={150} // Add spacing between ticks
        />
        <YAxis
          allowDataOverflow={true}
          axisLine={false}
          domain={[yAxisMin || 'auto', yAxisMax || 'auto']} // Dynamically adjust the domain
          tickCount={number_of_ticks} // Fixed to 4 ticks
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
          cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }} // Add a custom cursor for better visibility
          content={
            <ChartTooltipContent
              indicator="dot"
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
            zIndex: 1000, // Ensure the tooltip is above other elements
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Add a background for better readability
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        />
        {interfaces?.map((item: any) => {
          return (
            <Bar
              key={item?.value}
              dataKey={item?.value}
              fill={graphColors[item?.value] ? graphColors[item?.value] : '#16a34a'}
              isAnimationActive={false} // Disable animation for smooth effect
            />
          );
        })}
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;