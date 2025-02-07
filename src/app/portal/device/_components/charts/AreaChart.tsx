'use client'

import moment from 'moment';
import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'


const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  bandwidth: {
    label: 'Bandwidth',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function AreaChartSample({chartData}: any) {


  return (
    <Card>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart data={
  //           [
  // { second: '1s', bandwidth: 400 },
  // { second: '2', bandwidth: 184 },
  // { second: '3', bandwidth: 250 },
  // { second: '4', bandwidth: 39 },
  // { second: '5', bandwidth: 47 },
  // { second: '6', bandwidth: 164 },
  // { second: '7', bandwidth: 441 },
  // { second: '8', bandwidth: 165 },
  // { second: '9', bandwidth: 88 },
  // { second: '10', bandwidth: 299 },
  // { second: '11', bandwidth: 403 },
  // { second: '12', bandwidth: 6 },
  // { second: '13', bandwidth: 232 },
  // { second: '14', bandwidth: 235 },
  // { second: '15', bandwidth: 324 },
  // { second: '16', bandwidth: 324 },
  // { second: '17', bandwidth: 19 },
  // { second: '18', bandwidth: 274 },
  // { second: '19', bandwidth: 128 },
  // { second: '20', bandwidth: 403 },
  // { second: '21', bandwidth: 177 },
  // { second: '22', bandwidth: 402 },
  // { second: '23', bandwidth: 444 },
  // { second: '24', bandwidth: 146 },
  // { second: '25', bandwidth: 133 },
  // { second: '26', bandwidth: 157 },
  // { second: '27', bandwidth: 49 },
  // { second: '28', bandwidth: 332 },
  // { second: '29', bandwidth: 350 },
  // { second: '30s', bandwidth: 168 },
  // { second: '31', bandwidth: 121 },
  // { second: '32', bandwidth: 128 },
  // { second: '33', bandwidth: 106 },
  // { second: '34', bandwidth: 280 },
  // { second: '35', bandwidth: 429 },
  // { second: '36', bandwidth: 105 },
  // { second: '37', bandwidth: 487 },
  // { second: '38', bandwidth: 135 },
  // { second: '39', bandwidth: 345 },
  // { second: '40', bandwidth: 185 },
  // { second: '41', bandwidth: 53 },
  // { second: '42', bandwidth: 126 },
  // { second: '43', bandwidth: 436 },
  // { second: '44', bandwidth: 312 },
  // { second: '45', bandwidth: 166 },
  // { second: '46', bandwidth: 372 },
  // { second: '47', bandwidth: 419 },
  // { second: '48', bandwidth: 356 },
  // { second: '49', bandwidth: 201 },
  // { second: '50', bandwidth: 119 },
  // { second: '51', bandwidth: 56 },
  // { second: '52', bandwidth: 11 },
  // { second: '53', bandwidth: 284 },
  // { second: '54', bandwidth: 223 },
  // { second: '55', bandwidth: 325 },
  // { second: '56', bandwidth: 378 },
  // { second: '57', bandwidth: 87 },
  // { second: '58', bandwidth: 72 },
  // { second: '59', bandwidth: 284 },
  // { second: '1m', bandwidth: 309 },
  // { second: '61', bandwidth: 200 },
  // { second: '62', bandwidth: 467 },
  // { second: '63', bandwidth: 492 },
  // { second: '64', bandwidth: 173 },
  // { second: '65', bandwidth: 193 },
  // { second: '66', bandwidth: 410 },
  // { second: '67', bandwidth: 459 },
  // { second: '68', bandwidth: 144 },
  // { second: '69', bandwidth: 95 },
  // { second: '70', bandwidth: 50 },
  // { second: '71', bandwidth: 396 },
  // { second: '72', bandwidth: 470 },
  // { second: '73', bandwidth: 333 },
  // { second: '74', bandwidth: 184 },
  // { second: '75', bandwidth: 246 },
  // { second: '76', bandwidth: 154 },
  // { second: '77', bandwidth: 419 },
  // { second: '78', bandwidth: 282 },
  // { second: '79', bandwidth: 334 },
  // { second: '1m 30s', bandwidth: 348 },
  // { second: '81', bandwidth: 121 },
  // { second: '82', bandwidth: 489 },
  // { second: '83', bandwidth: 115 },
  // { second: '84', bandwidth: 392 },
  // { second: '85', bandwidth: 132 },
  // { second: '86', bandwidth: 358 },
  // { second: '87', bandwidth: 236 },
  // { second: '88', bandwidth: 293 },
  // { second: '89', bandwidth: 442 },
  // { second: '90', bandwidth: 496 },
  // { second: '91', bandwidth: 186 },
  // { second: '92', bandwidth: 184 },
  // { second: '93', bandwidth: 312 },
  // { second: '94', bandwidth: 155 },
  // { second: '95', bandwidth: 379 },
  // { second: '96', bandwidth: 206 },
  // { second: '97', bandwidth: 49 },
  // { second: '98', bandwidth: 156 },
  // { second: '99', bandwidth: 279 },
  // { second: '100', bandwidth: 229 },
  // { second: '101', bandwidth: 33 },
  // { second: '102', bandwidth: 270 },
  // { second: '103', bandwidth: 386 },
  // { second: '104', bandwidth: 102 },
  // { second: '105', bandwidth: 229 },
  // { second: '106', bandwidth: 480 },
  // { second: '107', bandwidth: 348 },
  // { second: '108', bandwidth: 181 },
  // { second: '109', bandwidth: 380 },
  // { second: '110', bandwidth: 170 },
  // { second: '111', bandwidth: 93 },
  // { second: '112', bandwidth: 456 },
  // { second: '113', bandwidth: 174 },
  // { second: '114', bandwidth: 296 },
  // { second: '115', bandwidth: 317 },
  // { second: '116', bandwidth: 404 },
  // { second: '117', bandwidth: 75 },
  // { second: '2m', bandwidth: 74 },
  // { second: '119', bandwidth: 393 },
  // { second: '2m', bandwidth: 54 },
  
//     { second: '121', bandwidth: 404 },
//     { second: '122', bandwidth: 236 },
//     { second: '123', bandwidth: 382 },
//     { second: '124', bandwidth: 254 },
//     { second: '125', bandwidth: 132 },
//     { second: '126', bandwidth: 452 },
//     { second: '127', bandwidth: 486 },
//     { second: '128', bandwidth: 127 },
//     { second: '129', bandwidth: 401 },
//     { second: '130', bandwidth: 47 },
//     { second: '131', bandwidth: 103 },
//     { second: '132', bandwidth: 307 },
//     { second: '133', bandwidth: 347 },
//     { second: '134', bandwidth: 274 },
//     { second: '135', bandwidth: 230 },
//     { second: '136', bandwidth: 471 },
//     { second: '137', bandwidth: 371 },
//     { second: '138', bandwidth: 80 },
//     { second: '139', bandwidth: 198 },
//     { second: '140', bandwidth: 488 },
//     { second: '141', bandwidth: 42 },
//     { second: '142', bandwidth: 492 },
//     { second: '143', bandwidth: 151 },
//     { second: '144', bandwidth: 321 },
//     { second: '145', bandwidth: 234 },
//     { second: '146', bandwidth: 403 },
//     { second: '147', bandwidth: 224 },
//     { second: '148', bandwidth: 197 },
//     { second: '149', bandwidth: 409 },
//     { second: '2m 30s', bandwidth: 45 },
//     { second: '151', bandwidth: 309 },
//     { second: '152', bandwidth: 139 },
//     { second: '153', bandwidth: 124 },
//     { second: '154', bandwidth: 431 },
//     { second: '155', bandwidth: 364 },
//     { second: '156', bandwidth: 212 },
//     { second: '157', bandwidth: 172 },
//     { second: '158', bandwidth: 474 },
//     { second: '159', bandwidth: 155 },
//     { second: '160', bandwidth: 136 },
//     { second: '161', bandwidth: 368 },
//     { second: '162', bandwidth: 282 },
//     { second: '163', bandwidth: 290 },
//     { second: '164', bandwidth: 293 },
//     { second: '165', bandwidth: 306 },
//     { second: '166', bandwidth: 105 },
//     { second: '167', bandwidth: 376 },
//     { second: '168', bandwidth: 34 },
//     { second: '169', bandwidth: 190 },
//     { second: '170', bandwidth: 199 },
//     { second: '171', bandwidth: 477 },
//     { second: '172', bandwidth: 261 },
//     { second: '173', bandwidth: 347 },
//     { second: '174', bandwidth: 293 },
//     { second: '175', bandwidth: 103 },
//     { second: '176', bandwidth: 159 },
//     { second: '177', bandwidth: 6 },
//     { second: '178', bandwidth: 205 },
//     { second: '179', bandwidth: 4 },
//     { second: '3m', bandwidth: 391 }
  
  
// ]
chartData
}>
            <defs>
              <linearGradient id="fillBandwidth" x1="1" y1="1" >
                <stop
                  offset="0%"
                  stopColor="var(--color-bandwidth)"
                  stopOpacity={0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bandwidth)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="1" x2="1" y1="1" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="second"
              minTickGap={30}
              tickFormatter={(value) => {
                // Only display values that are in the legendLabels array
                
                // return legendLabels.includes(value) ? value : value;
                return   moment(value).format('mm:ss')

              }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine = { false }
              tickCount = { 3 }

              tickLine = { false }
              tickMargin = { 8 }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => {
                    return  moment(value).format('MM/DD HH:mm:ss')
                  }}
                />
              }
              cursor={false}
            />
            <Area
              dataKey="bandwidth"
              fill="url(#fillBandwidth)"
              stackId="a"
              stroke="var(--color-bandwidth)"
              type="natural"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
