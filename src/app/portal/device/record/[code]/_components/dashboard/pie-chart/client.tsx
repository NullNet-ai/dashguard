"use client"

import React, { useState, useEffect } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { api } from "~/trpc/react";
import { getLastTimeStamp } from "~/app/portal/device/utils/timeRange";
import { IFormProps } from "../types";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const initialTraffic = 0;

const chartConfig = {
  traffic: {
    label: "Traffic",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const PieChartComponent = ({ defaultValues, interfaces }: IFormProps) => {
  console.log("%c Line:26 🍒 interfaces", "color:#ed9ec7", interfaces);
  
  const [trafficData, setTrafficData] = useState({
    traffic: initialTraffic,
    maxTraffic: 100,
  });
  const [animatedTraffic, setAnimatedTraffic] = useState(initialTraffic);

  const { refetch: fetchBandWidth} = api.packet.getLastBandwithInterfacePerSecond.useQuery(
      {
        bucket_size: '1s',
        timezone: timezone,
        device_id: defaultValues?.id,
        time_range: getLastTimeStamp(20, 'second', new Date()),
        interface_names: interfaces?.map((item: any) => item?.value),
      })
  
  // Fetch traffic data every second
  useEffect(() => {
    if (!defaultValues?.id || defaultValues?.device_status.toLowerCase() === "offline" || !interfaces?.length) return;
  
    const fetchChartData = async () => {
      try {
        const { data } = await fetchBandWidth();
        const currentTraffic = Number(data) || 0;
        // Ensure maxTraffic is always above currentTraffic for proper gauge display
        const maxTraffic = Math.max(currentTraffic * 2 + 100, trafficData.maxTraffic);
        setTrafficData({ traffic: currentTraffic, maxTraffic });
      } catch (error) {
        console.error("Error fetching bandwidth data:", error);
      }
    };
  
    fetchChartData();
    const interval = setInterval(fetchChartData, 3000);
    return () => clearInterval(interval);
  }, [defaultValues?.id, defaultValues?.device_status, fetchBandWidth, interfaces]);
  
  // Smooth animation effect - update more frequently with smaller steps
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedTraffic((prev) => {
        const diff = trafficData.traffic - prev;
        // Use a smaller factor for smoother animation (0.05 instead of 0.1)
        return Math.abs(diff) < 0.1 ? trafficData.traffic : prev + diff * 0.05;
      });
    }, 16); // Update at 60fps for smoother animation
    
    return () => clearInterval(animationInterval);
  }, [trafficData.traffic]);
  
  // Calculate angles with proper constraints
  const pieEndAngle = Math.max(0, 180 - (animatedTraffic / trafficData.maxTraffic) * 180);
  
  // Constrain arrow rotation between -90° and 90°
  const arrowRotation = Math.min(90, Math.max(-90, (animatedTraffic / trafficData.maxTraffic) * 180 - 90));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <div className="flex-1 pb-0 relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart width={300} height={300} className="relative z-10">
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            {/* Background gauge */}
            <Pie
              data={[{ name: "Full", value: trafficData.maxTraffic, fill: "#E5E7EB" }]}
              dataKey="value"
              nameKey="name"
              innerRadius={117}    // Increased from 110 by 7
              outerRadius={147}    // Increased from 140 by 7
              startAngle={180}
              endAngle={0}
            />
            {/* Traffic gauge */}
            <Pie
              data={[{ name: "Traffic", value: trafficData?.traffic, fill: chartConfig.traffic.color }]}
              dataKey="value"
              nameKey="name"
              innerRadius={117}    // Increased from 110 by 7
              outerRadius={147}    // Increased from 140 by 7
              startAngle={180}
              endAngle={pieEndAngle}
              animationBegin={0}
              animationDuration={0}
            />
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
          {/* Gauge needle */}
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            className="absolute transition-transform duration-[16ms] ease-linear"
            style={{ transform: `rotate(${arrowRotation}deg)` }}
          >
            <polygon points="150,45 142,150 158,150" fill="black" />
            <circle cx="150" cy="150" r="8" fill="black" />
          </svg>
          {/* Traffic value display */}
          <div className="absolute top-[160px] bg-background/80 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-xl font-bold tabular-nums">
              {Math.round(animatedTraffic)}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;