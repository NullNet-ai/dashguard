// "use client";
// import * as React from "react";
// import { Label, Pie, PieChart, Sector } from "recharts";
// import { type PieSectorDataItem } from "recharts/types/polar/Pie";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "~/components/ui/card";
// import {
//   type ChartConfig,
//   ChartContainer,
//   ChartStyle,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "~/components/ui/chart";
// import { api } from "~/trpc/react";

// const desktopData = [
//   { month: "january", desktop: 186, fill: "var(--color-january)" },
//   { month: "february", desktop: 305, fill: "var(--color-february)" },
//   { month: "march", desktop: 237, fill: "var(--color-march)" },
//   { month: "april", desktop: 173, fill: "var(--color-april)" },
//   { month: "may", desktop: 209, fill: "var(--color-may)" },
// ];

// const chartConfig = {
//   visitors: {
//     label: "Visitors",
//   },
//   desktop: {
//     label: "Desktop",
//   },
//   mobile: {
//     label: "Mobile",
//   },
//   january: {
//     label: "January",
//     color: "hsl(var(--chart-1))",
//   },
//   february: {
//     label: "February",
//     color: "hsl(var(--chart-2))",
//   },
//   march: {
//     label: "March",
//     color: "hsl(var(--chart-3))",
//   },
//   april: {
//     label: "April",
//     color: "hsl(var(--chart-4))",
//   },
//   may: {
//     label: "May",
//     color: "hsl(var(--chart-5))",
//   },
// } satisfies ChartConfig;

// export function BookingsCard() {
//   const id = "pie-interactive";

//   const { data: response } = api.bookingsCard.getBookingsByStatus.useQuery();

//   return (
//     <Card data-chart={id} className="flex flex-1 flex-col">
//       <ChartStyle id={id} config={chartConfig} />
//       <CardHeader className="flex-row items-start space-y-0 pb-0">
//         <div className="grid gap-1">
//           <CardTitle>Bookings </CardTitle>
//           <CardDescription>by Status</CardDescription>
//         </div>
//       </CardHeader>
//       <CardContent className="flex flex-1 justify-center pb-0">
//         <ChartContainer
//           id={id}
//           config={chartConfig}
//           className="mx-auto aspect-square w-full max-w-[300px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               cursor={false}
//               content={<ChartTooltipContent hideLabel />}
//             />
//             <Pie
//               data={response?.result}
//               dataKey="count"
//               nameKey="key"
//               innerRadius={60}
//               strokeWidth={5}
//               activeShape={({
//                 outerRadius = 0,
//                 ...props
//               }: PieSectorDataItem) => (
//                 <g>
//                   <Sector {...props} outerRadius={outerRadius + 10} />
//                   <Sector
//                     {...props}
//                     outerRadius={outerRadius + 25}
//                     innerRadius={outerRadius + 12}
//                   />
//                 </g>
//               )}
//             >
//               <Label
//                 content={({ viewBox }) => {
//                   if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                     return (
//                       <text
//                         x={viewBox.cx}
//                         y={viewBox.cy}
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                       >
//                         <tspan
//                           x={viewBox.cx}
//                           y={viewBox.cy}
//                           className="fill-foreground text-3xl font-bold"
//                         >
//                           {response?.total_count}
//                         </tspan>
//                         <tspan
//                           x={viewBox.cx}
//                           y={(viewBox.cy || 0) + 24}
//                           className="fill-muted-foreground"
//                         >
//                           Bookings
//                         </tspan>
//                       </text>
//                     );
//                   }
//                 }}
//               />
//             </Pie>
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

export {};
