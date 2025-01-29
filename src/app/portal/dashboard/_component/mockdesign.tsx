// "use client";

// import {
//   Area,
//   AreaChart,
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Label,
//   LabelList,
//   Line,
//   LineChart,
//   PolarAngleAxis,
//   RadialBar,
//   RadialBarChart,
//   Rectangle,
//   ReferenceLine,
//   XAxis,
//   YAxis,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "~/components//ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "~/components//ui/chart";
// import { Separator } from "~/components//ui/separator";
// import { useSidebar } from "~/hooks/use-sidebar";
// import { useStore } from "~/hooks/use-store";

// // export const description = "A collection of health charts.";

// // const schema = z.object({
// //   name: z.string().min(1, "Name is required"),
// //   email: z.array(z.string().email("Invalid email address")),
// //   age: z
// //     .string()
// //     .transform((val) => parseInt(val, 10))
// //     .refine((val) => !isNaN(val) && val >= 18, {
// //       message: "You must be at least 18 years old",
// //     }),
// //   hobbies: z.string(),
// //   inputs: z.array(z.string()),
// //   "appointment-date": z.string(
// //     z.date().refine((date) => date >= new Date(), {
// //       message: "Appointment date must be in the future.",
// //     }),
// //   ),
// //   "booking-date": z.date().refine((date) => date >= new Date(), {
// //     message: "Booking date must be in the future.",
// //   }),

// //   description: z
// //     .string()
// //     .min(10, { message: "Description must be at least 10 characters." })
// //     .max(500, {
// //       message: "Description must be less than 500 characters.",
// //     }),
// //   file: z.string().url(),
// //   phone: z
// //     .array(
// //       z.object({
// //         phoneNumber: z
// //           .string()
// //           .min(5, "Phone number must be at least 5 characters."),
// //         isoCode: z.string().optional(),
// //         countryCode: z.string().optional(),
// //       }),
// //     )
// //     .min(1, "Please add at least one phone number."),
// //   skills: z.array(z.string()),
// //   gender: z.enum(["male", "female", "other"], {
// //     errorMap: () => ({ message: "Please select a gender" }),
// //   }),
// //   preferredContact: z.enum(["email", "phone", "mail"]),
// // });

// // type Option = {
// //   value: string;
// //   label: string;
// // };
// // const OPTIONS: Option[] = [
// //   { label: "nextjs", value: "Nextjs" },
// //   { label: "React", value: "react" },
// //   { label: "Remix", value: "remix" },
// //   { label: "Vite", value: "vite" },
// //   { label: "Nuxt", value: "nuxt" },
// //   { label: "Vue", value: "vue" },
// //   { label: "Svelte", value: "svelte" },
// //   { label: "Angular", value: "angular" },
// //   { label: "Ember", value: "ember" },
// //   { label: "Gatsby", value: "gatsby" },
// //   { label: "Astro", value: "astro" },
// // ];

// // const mockSearch = async (value: string): Promise<Option[]> => {
// //   return new Promise((resolve) => {
// //     setTimeout(() => {
// //       const res = OPTIONS.filter((option) => option.value.includes(value));
// //       resolve(res);
// //     }, 1000);
// //   });
// // };

// {
//   /* <Switch
//             id="is-hover-open"
//             onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
//             checked={settings.isHoverOpen}
//           />
//           <Label htmlFor="is-hover-open">Hover Open</Label> */
// }
// const Dashboard = () => {
//   const sidebar = useStore(useSidebar, (x) => x);
//   if (!sidebar) return null;
//   const { settings, setSettings } = sidebar;
//   return (
//     <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
//       <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
//         <Card className="lg:max-w-md" x-chunk="charts-01-chunk-0">
//           <CardHeader className="space-y-0 pb-2">
//             <CardDescription>Today</CardDescription>
//             <CardTitle className="text-4xl tabular-nums">
//               12,584{" "}
//               <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
//                 steps
//               </span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer
//               config={{
//                 steps: {
//                   label: "Steps",
//                   color: "hsl(var(--chart-1))",
//                 },
//               }}
//             >
//               <BarChart
//                 accessibilityLayer
//                 margin={{
//                   left: -4,
//                   right: -4,
//                 }}
//                 data={[
//                   {
//                     date: "2024-01-01",
//                     steps: 2000,
//                   },
//                   {
//                     date: "2024-01-02",
//                     steps: 2100,
//                   },
//                   {
//                     date: "2024-01-03",
//                     steps: 2200,
//                   },
//                   {
//                     date: "2024-01-04",
//                     steps: 1300,
//                   },
//                   {
//                     date: "2024-01-05",
//                     steps: 1400,
//                   },
//                   {
//                     date: "2024-01-06",
//                     steps: 2500,
//                   },
//                   {
//                     date: "2024-01-07",
//                     steps: 1600,
//                   },
//                 ]}
//               >
//                 <Bar
//                   dataKey="steps"
//                   fill="var(--color-steps)"
//                   radius={5}
//                   fillOpacity={0.6}
//                   activeBar={<Rectangle fillOpacity={0.8} />}
//                 />
//                 <XAxis
//                   dataKey="date"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={4}
//                   tickFormatter={(value) => {
//                     return new Date(value).toLocaleDateString("en-US", {
//                       weekday: "short",
//                     });
//                   }}
//                 />
//                 <ChartTooltip
//                   defaultIndex={2}
//                   content={
//                     <ChartTooltipContent
//                       hideIndicator
//                       labelFormatter={(value) => {
//                         return new Date(value).toLocaleDateString("en-US", {
//                           day: "numeric",
//                           month: "long",
//                           year: "numeric",
//                         });
//                       }}
//                     />
//                   }
//                   cursor={false}
//                 />
//                 <ReferenceLine
//                   y={1200}
//                   stroke="hsl(var(--muted-foreground))"
//                   strokeDasharray="3 3"
//                   strokeWidth={1}
//                 >
//                   <Label
//                     position="insideBottomLeft"
//                     value="Average Steps"
//                     offset={10}
//                     fill="hsl(var(--foreground))"
//                   />
//                   <Label
//                     position="insideTopLeft"
//                     value="12,343"
//                     className="text-lg"
//                     fill="hsl(var(--foreground))"
//                     offset={10}
//                     startOffset={100}
//                   />
//                 </ReferenceLine>
//               </BarChart>
//             </ChartContainer>
//           </CardContent>
//           <CardFooter className="flex-col items-start gap-1">
//             <CardDescription>
//               Over the past 7 days, you have walked{" "}
//               <span className="font-medium text-foreground">53,305</span> steps.
//             </CardDescription>
//             <CardDescription>
//               You need{" "}
//               <span className="font-medium text-foreground">12,584</span> more
//               steps to reach your goal.
//             </CardDescription>
//           </CardFooter>
//         </Card>
//         <Card className="flex flex-col lg:max-w-md" x-chunk="charts-01-chunk-1">
//           <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
//             <div>
//               <CardDescription>Resting HR</CardDescription>
//               <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
//                 62
//                 <span className="text-sm font-normal tracking-normal text-muted-foreground">
//                   bpm
//                 </span>
//               </CardTitle>
//             </div>
//             <div>
//               <CardDescription>Variability</CardDescription>
//               <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
//                 35
//                 <span className="text-sm font-normal tracking-normal text-muted-foreground">
//                   ms
//                 </span>
//               </CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent className="flex flex-1 items-center">
//             <ChartContainer
//               config={{
//                 resting: {
//                   label: "Resting",
//                   color: "hsl(var(--chart-1))",
//                 },
//               }}
//               className="w-full"
//             >
//               <LineChart
//                 accessibilityLayer
//                 margin={{
//                   left: 14,
//                   right: 14,
//                   top: 10,
//                 }}
//                 data={[
//                   {
//                     date: "2024-01-01",
//                     resting: 62,
//                   },
//                   {
//                     date: "2024-01-02",
//                     resting: 72,
//                   },
//                   {
//                     date: "2024-01-03",
//                     resting: 35,
//                   },
//                   {
//                     date: "2024-01-04",
//                     resting: 62,
//                   },
//                   {
//                     date: "2024-01-05",
//                     resting: 52,
//                   },
//                   {
//                     date: "2024-01-06",
//                     resting: 62,
//                   },
//                   {
//                     date: "2024-01-07",
//                     resting: 70,
//                   },
//                 ]}
//               >
//                 <CartesianGrid
//                   strokeDasharray="4 4"
//                   vertical={false}
//                   stroke="hsl(var(--muted-foreground))"
//                   strokeOpacity={0.5}
//                 />
//                 <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
//                 <XAxis
//                   dataKey="date"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={8}
//                   tickFormatter={(value) => {
//                     return new Date(value).toLocaleDateString("en-US", {
//                       weekday: "short",
//                     });
//                   }}
//                 />
//                 <Line
//                   dataKey="resting"
//                   type="natural"
//                   fill="var(--color-resting)"
//                   stroke="var(--color-resting)"
//                   strokeWidth={2}
//                   dot={false}
//                   activeDot={{
//                     fill: "var(--color-resting)",
//                     stroke: "var(--color-resting)",
//                     r: 4,
//                   }}
//                 />
//                 <ChartTooltip
//                   content={
//                     <ChartTooltipContent
//                       indicator="line"
//                       labelFormatter={(value) => {
//                         return new Date(value).toLocaleDateString("en-US", {
//                           day: "numeric",
//                           month: "long",
//                           year: "numeric",
//                         });
//                       }}
//                     />
//                   }
//                   cursor={false}
//                 />
//               </LineChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>
//       <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
//         <Card className="max-w-xs" x-chunk="charts-01-chunk-2">
//           <CardHeader>
//             <CardTitle>Progress</CardTitle>
//             <CardDescription>
//               {" You're average more steps a day this year than last year."}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             <div className="grid auto-rows-min gap-2">
//               <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//                 12,453
//                 <span className="text-sm font-normal text-muted-foreground">
//                   steps/day
//                 </span>
//               </div>
//               <ChartContainer
//                 config={{
//                   steps: {
//                     label: "Steps",
//                     color: "hsl(var(--chart-1))",
//                   },
//                 }}
//                 className="aspect-auto h-[32px] w-full"
//               >
//                 <BarChart
//                   accessibilityLayer
//                   layout="vertical"
//                   margin={{
//                     left: 0,
//                     top: 0,
//                     right: 0,
//                     bottom: 0,
//                   }}
//                   data={[
//                     {
//                       date: "2024",
//                       steps: 12435,
//                     },
//                   ]}
//                 >
//                   <Bar
//                     dataKey="steps"
//                     fill="var(--color-steps)"
//                     radius={4}
//                     barSize={32}
//                   >
//                     <LabelList
//                       position="insideLeft"
//                       dataKey="date"
//                       offset={8}
//                       fontSize={12}
//                       fill="white"
//                     />
//                   </Bar>
//                   <YAxis dataKey="date" type="category" tickCount={1} hide />
//                   <XAxis dataKey="steps" type="number" hide />
//                 </BarChart>
//               </ChartContainer>
//             </div>
//             <div className="grid auto-rows-min gap-2">
//               <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//                 10,103
//                 <span className="text-sm font-normal text-muted-foreground">
//                   steps/day
//                 </span>
//               </div>
//               <ChartContainer
//                 config={{
//                   steps: {
//                     label: "Steps",
//                     color: "hsl(var(--muted))",
//                   },
//                 }}
//                 className="aspect-auto h-[32px] w-full"
//               >
//                 <BarChart
//                   accessibilityLayer
//                   layout="vertical"
//                   margin={{
//                     left: 0,
//                     top: 0,
//                     right: 0,
//                     bottom: 0,
//                   }}
//                   data={[
//                     {
//                       date: "2023",
//                       steps: 10103,
//                     },
//                   ]}
//                 >
//                   <Bar
//                     dataKey="steps"
//                     fill="var(--color-steps)"
//                     radius={4}
//                     barSize={32}
//                   >
//                     <LabelList
//                       position="insideLeft"
//                       dataKey="date"
//                       offset={8}
//                       fontSize={12}
//                       fill="hsl(var(--muted-foreground))"
//                     />
//                   </Bar>
//                   <YAxis dataKey="date" type="category" tickCount={1} hide />
//                   <XAxis dataKey="steps" type="number" hide />
//                 </BarChart>
//               </ChartContainer>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="max-w-xs" x-chunk="charts-01-chunk-3">
//           <CardHeader className="p-4 pb-0">
//             <CardTitle>Walking Distance</CardTitle>
//             <CardDescription>
//               Over the last 7 days, your distance walked and run was 12.5 miles
//               per day.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
//             <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
//               12.5
//               <span className="text-sm font-normal text-muted-foreground">
//                 miles/day
//               </span>
//             </div>
//             <ChartContainer
//               config={{
//                 steps: {
//                   label: "Steps",
//                   color: "hsl(var(--chart-1))",
//                 },
//               }}
//               className="ml-auto w-[72px]"
//             >
//               <BarChart
//                 accessibilityLayer
//                 margin={{
//                   left: 0,
//                   right: 0,
//                   top: 0,
//                   bottom: 0,
//                 }}
//                 data={[
//                   {
//                     date: "2024-01-01",
//                     steps: 2000,
//                   },
//                   {
//                     date: "2024-01-02",
//                     steps: 2100,
//                   },
//                   {
//                     date: "2024-01-03",
//                     steps: 2200,
//                   },
//                   {
//                     date: "2024-01-04",
//                     steps: 1300,
//                   },
//                   {
//                     date: "2024-01-05",
//                     steps: 1400,
//                   },
//                   {
//                     date: "2024-01-06",
//                     steps: 2500,
//                   },
//                   {
//                     date: "2024-01-07",
//                     steps: 1600,
//                   },
//                 ]}
//               >
//                 <Bar
//                   dataKey="steps"
//                   fill="var(--color-steps)"
//                   radius={2}
//                   fillOpacity={0.2}
//                   activeIndex={6}
//                   activeBar={<Rectangle fillOpacity={0.8} />}
//                 />
//                 <XAxis
//                   dataKey="date"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={4}
//                   hide
//                 />
//               </BarChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//         <Card className="max-w-xs" x-chunk="charts-01-chunk-4">
//           <CardContent className="flex gap-4 p-4 pb-2">
//             <ChartContainer
//               config={{
//                 move: {
//                   label: "Move",
//                   color: "hsl(var(--chart-1))",
//                 },
//                 stand: {
//                   label: "Stand",
//                   color: "hsl(var(--chart-2))",
//                 },
//                 exercise: {
//                   label: "Exercise",
//                   color: "hsl(var(--chart-3))",
//                 },
//               }}
//               className="h-[140px] w-full"
//             >
//               <BarChart
//                 margin={{
//                   left: 0,
//                   right: 0,
//                   top: 0,
//                   bottom: 10,
//                 }}
//                 data={[
//                   {
//                     activity: "stand",
//                     value: (8 / 12) * 100,
//                     label: "8/12 hr",
//                     fill: "var(--color-stand)",
//                   },
//                   {
//                     activity: "exercise",
//                     value: (46 / 60) * 100,
//                     label: "46/60 min",
//                     fill: "var(--color-exercise)",
//                   },
//                   {
//                     activity: "move",
//                     value: (245 / 360) * 100,
//                     label: "245/360 kcal",
//                     fill: "var(--color-move)",
//                   },
//                 ]}
//                 layout="vertical"
//                 barSize={32}
//                 barGap={2}
//               >
//                 <XAxis type="number" dataKey="value" hide />
//                 <YAxis
//                   dataKey="activity"
//                   type="category"
//                   tickLine={false}
//                   tickMargin={4}
//                   axisLine={false}
//                   className="capitalize"
//                 />
//                 <Bar dataKey="value" radius={5}>
//                   <LabelList
//                     position="insideLeft"
//                     dataKey="label"
//                     fill="white"
//                     offset={8}
//                     fontSize={12}
//                   />
//                 </Bar>
//               </BarChart>
//             </ChartContainer>
//           </CardContent>
//           <CardFooter className="flex flex-row border-t p-4">
//             <div className="flex w-full items-center gap-2">
//               <div className="grid flex-1 auto-rows-min gap-0.5">
//                 <div className="text-xs text-muted-foreground">Move</div>
//                 <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//                   562
//                   <span className="text-sm font-normal text-muted-foreground">
//                     kcal
//                   </span>
//                 </div>
//               </div>
//               <Separator orientation="vertical" className="mx-2 h-10 w-px" />
//               <div className="grid flex-1 auto-rows-min gap-0.5">
//                 <div className="text-xs text-muted-foreground">Exercise</div>
//                 <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//                   73
//                   <span className="text-sm font-normal text-muted-foreground">
//                     min
//                   </span>
//                 </div>
//               </div>
//               <Separator orientation="vertical" className="mx-2 h-10 w-px" />
//               <div className="grid flex-1 auto-rows-min gap-0.5">
//                 <div className="text-xs text-muted-foreground">Stand</div>
//                 <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//                   14
//                   <span className="text-sm font-normal text-muted-foreground">
//                     hr
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//       <div className="grid w-full flex-1 gap-6">
//         <Card className="max-w-xs" x-chunk="charts-01-chunk-5">
//           <CardContent className="flex gap-4 p-4">
//             <div className="grid items-center gap-2">
//               <div className="grid flex-1 auto-rows-min gap-0.5">
//                 <div className="text-sm text-muted-foreground">Move</div>
//                 <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
//                   562/600
//                   <span className="text-sm font-normal text-muted-foreground">
//                     kcal
//                   </span>
//                 </div>
//               </div>
//               <div className="grid flex-1 auto-rows-min gap-0.5">
//                 <div className="text-sm text-muted-foreground">Exercise</div>
//                 <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
//                   73/120
//                   <span className="text-sm font-normal text-muted-foreground">
//                     min
//                   </span>
//                 </div>
//               </div>
//               <div className="grid flex-1 auto-rows-min gap-0.5">
//                 <div className="text-sm text-muted-foreground">Stand</div>
//                 <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
//                   8/12
//                   <span className="text-sm font-normal text-muted-foreground">
//                     hr
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <ChartContainer
//               config={{
//                 move: {
//                   label: "Move",
//                   color: "hsl(var(--chart-1))",
//                 },
//                 exercise: {
//                   label: "Exercise",
//                   color: "hsl(var(--chart-2))",
//                 },
//                 stand: {
//                   label: "Stand",
//                   color: "hsl(var(--chart-3))",
//                 },
//               }}
//               className="mx-auto aspect-square w-full max-w-[80%]"
//             >
//               <RadialBarChart
//                 margin={{
//                   left: -10,
//                   right: -10,
//                   top: -10,
//                   bottom: -10,
//                 }}
//                 data={[
//                   {
//                     activity: "stand",
//                     value: (8 / 12) * 100,
//                     fill: "var(--color-stand)",
//                   },
//                   {
//                     activity: "exercise",
//                     value: (46 / 60) * 100,
//                     fill: "var(--color-exercise)",
//                   },
//                   {
//                     activity: "move",
//                     value: (245 / 360) * 100,
//                     fill: "var(--color-move)",
//                   },
//                 ]}
//                 innerRadius="20%"
//                 barSize={24}
//                 startAngle={90}
//                 endAngle={450}
//               >
//                 <PolarAngleAxis
//                   type="number"
//                   domain={[0, 100]}
//                   dataKey="value"
//                   tick={false}
//                 />
//                 <RadialBar dataKey="value" background cornerRadius={5} />
//               </RadialBarChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//         <Card className="max-w-xs" x-chunk="charts-01-chunk-6">
//           <CardHeader className="p-4 pb-0">
//             <CardTitle>Active Energy</CardTitle>
//             <CardDescription>
//               {"You're burning an average of 754 calories per day. Good job!"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
//             <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
//               1,254
//               <span className="text-sm font-normal text-muted-foreground">
//                 kcal/day
//               </span>
//             </div>
//             <ChartContainer
//               config={{
//                 calories: {
//                   label: "Calories",
//                   color: "hsl(var(--chart-1))",
//                 },
//               }}
//               className="ml-auto w-[64px]"
//             >
//               <BarChart
//                 accessibilityLayer
//                 margin={{
//                   left: 0,
//                   right: 0,
//                   top: 0,
//                   bottom: 0,
//                 }}
//                 data={[
//                   {
//                     date: "2024-01-01",
//                     calories: 354,
//                   },
//                   {
//                     date: "2024-01-02",
//                     calories: 514,
//                   },
//                   {
//                     date: "2024-01-03",
//                     calories: 345,
//                   },
//                   {
//                     date: "2024-01-04",
//                     calories: 734,
//                   },
//                   {
//                     date: "2024-01-05",
//                     calories: 645,
//                   },
//                   {
//                     date: "2024-01-06",
//                     calories: 456,
//                   },
//                   {
//                     date: "2024-01-07",
//                     calories: 345,
//                   },
//                 ]}
//               >
//                 <Bar
//                   dataKey="calories"
//                   fill="var(--color-calories)"
//                   radius={2}
//                   fillOpacity={0.2}
//                   activeIndex={6}
//                   activeBar={<Rectangle fillOpacity={0.8} />}
//                 />
//                 <XAxis
//                   dataKey="date"
//                   tickLine={false}
//                   axisLine={false}
//                   tickMargin={4}
//                   hide
//                 />
//               </BarChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//         <Card className="max-w-xs" x-chunk="charts-01-chunk-7">
//           <CardHeader className="space-y-0 pb-0">
//             <CardDescription>Time in Bed</CardDescription>
//             <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
//               8
//               <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
//                 hr
//               </span>
//               35
//               <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
//                 min
//               </span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <ChartContainer
//               config={{
//                 time: {
//                   label: "Time",
//                   color: "hsl(var(--chart-2))",
//                 },
//               }}
//             >
//               <AreaChart
//                 accessibilityLayer
//                 data={[
//                   {
//                     date: "2024-01-01",
//                     time: 8.5,
//                   },
//                   {
//                     date: "2024-01-02",
//                     time: 7.2,
//                   },
//                   {
//                     date: "2024-01-03",
//                     time: 8.1,
//                   },
//                   {
//                     date: "2024-01-04",
//                     time: 6.2,
//                   },
//                   {
//                     date: "2024-01-05",
//                     time: 5.2,
//                   },
//                   {
//                     date: "2024-01-06",
//                     time: 8.1,
//                   },
//                   {
//                     date: "2024-01-07",
//                     time: 7.0,
//                   },
//                 ]}
//                 margin={{
//                   left: 0,
//                   right: 0,
//                   top: 0,
//                   bottom: 0,
//                 }}
//               >
//                 <XAxis dataKey="date" hide />
//                 <YAxis domain={["dataMin - 5", "dataMax + 2"]} hide />
//                 <defs>
//                   <linearGradient id="fillTime" x1="0" y1="0" x2="0" y2="1">
//                     <stop
//                       offset="5%"
//                       stopColor="var(--color-time)"
//                       stopOpacity={0.8}
//                     />
//                     <stop
//                       offset="95%"
//                       stopColor="var(--color-time)"
//                       stopOpacity={0.1}
//                     />
//                   </linearGradient>
//                 </defs>
//                 <Area
//                   dataKey="time"
//                   type="natural"
//                   fill="url(#fillTime)"
//                   fillOpacity={0.4}
//                   stroke="var(--color-time)"
//                 />
//                 <ChartTooltip
//                   cursor={false}
//                   content={<ChartTooltipContent hideLabel />}
//                   formatter={(value) => (
//                     <div className="flex min-w-[120px] items-center text-xs text-muted-foreground">
//                       Time in bed
//                       <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
//                         {value}
//                         <span className="font-normal text-muted-foreground">
//                           hr
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 />
//               </AreaChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// // import Image from 'next/image'
// // export default function Page() {
// //   const imageLinks = [
// //     "https://files.gorentals.dnamicro.net/go-production-files/df9f33f8-a918-43e3-976e-dd4f8a445998_46FA39A9-976C-40DA-B597-1CAEFA0C8D67.jpg",
// //     "https://files.gorentals.dnamicro.net/go-production-images/1524feb7-333a-476d-830d-fb96659f5aee.jpeg",
// //     "https://files.gorentals.dnamicro.net/go-production-images/a5c27df7-a676-4272-964d-5f9da75299b6.jpeg",
// //     "https://files.gorentals.dnamicro.net/go-production-images/4d9c36f2-a70a-4e8b-b969-6fb8c2845527.jpeg",
// //     "https://files.gorentals.dnamicro.net/go-qa-files/1728587113011.jpg",
// //     "https://files.gorentals.dnamicro.net/go-qa-files/6536ea1b-1d1a-49d2-ac82-f0c8db39c238_Screenshot%202024-10-11%20at%2012.05.34%E2%80%AFa.m..png",
// //     "https://files.gorentals.dnamicro.net/go-development-images/daaba9d9-7fd8-48a3-9276-412609a14021.jpeg",
// //     "https://files.gorentals.dnamicro.net/go-development-images/89bf3444-d348-4536-86b9-f1d82f67d794.jpeg",
// //   ];

// //   return (
// //     <div>
// //       {imageLinks.map((src, index) => (
// //         <Image key={index} src={src} alt={`Image ${index + 1}`} width={500} height={300} />
// //       ))}
// //     </div>
// //   );
// // }

export {};
