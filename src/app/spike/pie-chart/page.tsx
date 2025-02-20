"use client"

import React, { useState, useEffect } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const initialTraffic = 0;
const maxTraffic = 100;

const chartConfig = {
  traffic: {
    label: "Traffic",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const Component = () => {
  const [traffic, setTraffic] = useState(initialTraffic);
  const [previousTraffic, setPreviousTraffic] = useState(initialTraffic);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic((prevTraffic) => {
        const newTraffic = Math.floor(Math.random() * maxTraffic);
        setPreviousTraffic(prevTraffic);
        return newTraffic;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isTrendingUp = traffic > previousTraffic;
  const arrowRotation = (traffic / maxTraffic) * 180 - 90;

  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Traffic Data</CardTitle>
        <CardDescription>Live Traffic Updates</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 relative">
        <div className="relative w-[250px] h-[250px]">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart width={250} height={250} className="relative z-10">
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              {/* Background Transparent Half */}
              <Pie
                data={[{ name: "Full", value: maxTraffic, fill: "#E5E7EB" }]} // Gray background
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={0}
              />
              {/* Dynamic Traffic Overlay */}
              <Pie
                data={[{ name: "Traffic", value: traffic, fill: chartConfig.traffic.color }]}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                startAngle={180}
                endAngle={180 - (traffic / maxTraffic) * 180}
              />
            </PieChart>
          </ChartContainer>
          {/* SVG Gauge Needle */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="absolute"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              <line
                x1="50" y1="50" x2="50" y2="10" // Adjust the line length and position
                stroke="black" strokeWidth="4"
                transform={`rotate(${arrowRotation}, 50, 50)`} // Rotate around the center
              />
              <circle cx="50" cy="50" r="5" fill="black" />
            </svg>
            {tooltipVisible && (
              <div className="absolute bottom-12 bg-gray-700 text-white text-xs px-2 py-1 rounded">
                Traffic: {traffic}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {isTrendingUp ? (
            <>Traffic up by {traffic}% <TrendingUp className="h-4 w-4 text-green-500" /></>
          ) : (
            <>Traffic down by {traffic}% <TrendingDown className="h-4 w-4 text-red-500" /></>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Live traffic percentage updates every 3 seconds
        </div>
      </CardFooter>
    </Card>
  );
};

export default Component;