"use client"

import React, { useState, useEffect, useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { api } from "~/trpc/react";
import { getLastMinutesTimeStamp, getLastTimeStamp } from "~/app/portal/device/utils/timeRange";
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
  
  const [trafficData, setTrafficData] = useState({
    traffic: initialTraffic,
    maxTraffic: 100,
  });
  const [animatedTraffic, setAnimatedTraffic] = useState(initialTraffic);
  // const { data, refetch: fetchBandWidth } = api?.packet.getBandwithPerSecond?.useQuery({
    //   device_id: defaultValues?.id,
    //   time_range: getLastTimeStamp(1,'second'),
    //   bucket_size: "1s",
    //   timezone,
    // })
    

  const { refetch: fetchBandWidth} = api.packet.getLastBandwithInterfacePerSecond.useQuery(
      {
        
        bucket_size: '1s',
        timezone: timezone,
        device_id: defaultValues?.id,
        time_range:  getLastTimeStamp(20,'second', new Date()),
        interface_names: interfaces?.map((item: any) => item?.value),
      })
  

  useEffect(() => {
    
    if (!defaultValues?.id || defaultValues?.device_status.toLowerCase() === 'offline') return;

    const fetchChartData = async () => {
      const { data } = await fetchBandWidth();
        const currentTraffic = Number(data) || 0;
        const maxTraffic = currentTraffic * 2;
        setTrafficData({ traffic: currentTraffic,  maxTraffic });

    };

    fetchChartData();
    const interval = setInterval(fetchChartData, 1000);
    return () => clearInterval(interval);
  }, [defaultValues?.id, defaultValues?.device_status]);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedTraffic((prev) => {
        const diff = trafficData.traffic - prev;
        return Math.abs(diff) < 0.1 ? trafficData.traffic : prev + diff * 0.1;
      });
    }, 16);
    return () => clearInterval(animationInterval);
  }, [trafficData.traffic]);

  const pieEndAngle = 180 - (animatedTraffic / trafficData.maxTraffic) * 180;
  const arrowRotation = (animatedTraffic / trafficData.maxTraffic) * 180 - 90;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <div className="flex-1 pb-0 relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart width={300} height={300} className="relative z-10">
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={[{ name: "Full", value: trafficData.maxTraffic, fill: "#E5E7EB" }]}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={90}
              startAngle={180}
              endAngle={0}
            />
            <Pie
              data={[{ name: "Traffic", value: trafficData.traffic, fill: chartConfig.traffic.color }]}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={90}
              startAngle={180}
              endAngle={pieEndAngle}
            />
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="absolute transition-transform duration-[16ms] ease-linear"
            style={{ transform: `rotate(${arrowRotation}deg)` }}
          >
            <polygon points="100,30 95,100 105,100" fill="black" />
            <circle cx="100" cy="100" r="6" fill="black" />
          </svg>
          <div className="absolute top-[160px] bg-background/80 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-xl font-bold tabular-nums">
              {Math.round(animatedTraffic)}
            </div>
          </div>
        </div>
      </div>
      {/* <Card className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <CardHeader className="items-center pb-0">
          <CardTitle>Pie Chart - Traffic Data</CardTitle>
          <CardDescription>Live Traffic Updates</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 relative">
          <div className="relative w-[300px] h-[300px]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart width={300} height={300} className="relative z-10">
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={[{ name: "Full", value: trafficData.maxTraffic, fill: "#E5E7EB" }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={180}
                  endAngle={0}
                />
                <Pie
                  data={[{ name: "Traffic", value: trafficData.traffic, fill: chartConfig.traffic.color }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={180}
                  endAngle={pieEndAngle}
                />
              </PieChart>
            </ChartContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="absolute transition-transform duration-[16ms] ease-linear"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <polygon points="100,30 95,100 105,100" fill="black" />
                <circle cx="100" cy="100" r="6" fill="black" />
              </svg>
              <div className="absolute top-[160px] bg-background/80 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="text-xl font-bold tabular-nums">
                  {Math.round(animatedTraffic)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            {isTrendingUp ? (
              <>Traffic up to {Math.round(trafficData.traffic)} <TrendingUp className="h-4 w-4 text-green-500" /></>
            ) : (
              <>Traffic down to {Math.round(trafficData.traffic)} <TrendingDown className="h-4 w-4 text-red-500" /></>
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            Live traffic percentage updates every second
          </div>
        </CardFooter>
      </Card> */}
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
