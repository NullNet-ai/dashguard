"use client"

import React, { useState, useEffect } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Pie, PieChart, Tooltip } from "recharts";
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

const initialTraffic = 0;
const maxTraffic = 100;

const chartConfig = {
  traffic: {
    label: "Traffic",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const Component = () => {
  const [trafficData, setTrafficData] = useState({
    traffic: initialTraffic,
    previousTraffic: initialTraffic,
  });
  const [animatedTraffic, setAnimatedTraffic] = useState(initialTraffic);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData((prevData) => {
        const newTraffic = Math.floor(Math.random() * maxTraffic);
        return {
          traffic: newTraffic,
          previousTraffic: prevData.traffic,
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedTraffic((prev) => {
        const diff = trafficData.traffic - prev;
        if (Math.abs(diff) < 0.1) return trafficData.traffic;
        return prev + diff * 0.1;
      });
    }, 16);
    return () => clearInterval(animationInterval);
  }, [trafficData.traffic]);

  const isTrendingUp = trafficData.traffic > trafficData.previousTraffic;
  const pieEndAngle = 180 - (animatedTraffic / maxTraffic) * 180;
  const arrowRotation = (animatedTraffic / maxTraffic) * 180 - 90;

  // Generate scale markers and labels
  const renderScaleMarkers = () => {
    const markers = [];
    for (let i = 0; i <= 100; i += 25) {
      const angle = -180 + (i / 100) * 180;
      const radians = (angle * Math.PI) / 180;
      const innerRadius = 45;
      const outerRadius = 55;
      const labelRadius = i === 0 || i === 100 ? 70 : 75;
      
      const x1 = 100 + innerRadius * Math.cos(radians);
      const y1 = 100 + innerRadius * Math.sin(radians);
      const x2 = 100 + outerRadius * Math.cos(radians);
      const y2 = 100 + outerRadius * Math.sin(radians);
      const labelX = 100 + labelRadius * Math.cos(radians);
      const labelY = 100 + labelRadius * Math.sin(radians);

      let labelAdjustment = "";
      if (i === 0) {
        labelAdjustment = "translate(-10, 0)";
      } else if (i === 100) {
        labelAdjustment = "translate(10, 0)";
      }

      markers.push(
        <g key={i}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-muted-foreground"
            style={{ transform: labelAdjustment }}
          >
            {i}
          </text>
        </g>
      );
    }
    return markers;
  };

  return (
    <div>
      <Card className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
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
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={[{ name: "Full", value: maxTraffic, fill: "#E5E7EB" }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={180}
                  endAngle={0}
                />
                <Pie
                  data={[{ name: "Traffic", value: maxTraffic, fill: chartConfig.traffic.color }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={180}
                  endAngle={pieEndAngle}
                />
              </PieChart>
            </ChartContainer>
            <svg
              width="300"
              height="300"
              viewBox="0 0 200 200"
              className="absolute inset-0 z-20"
            >
              {renderScaleMarkers()}
            </svg>
            {/* Gauge Needle and Label Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
              {/* SVG Gauge Needle */}
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
              {/* Label positioned below the needle */}
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
              <>Traffic up to {Math.round(trafficData.traffic)}% <TrendingUp className="h-4 w-4 text-green-500" /></>
            ) : (
              <>Traffic down to {Math.round(trafficData.traffic)}% <TrendingDown className="h-4 w-4 text-red-500" /></>
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            Live traffic percentage updates every 3 seconds
          </div>
        </CardFooter>
      </div>
      </Card>
    </div>
  );
};

export default Component;