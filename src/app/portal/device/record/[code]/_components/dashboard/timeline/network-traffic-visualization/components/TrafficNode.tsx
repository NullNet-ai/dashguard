import { Handle, Position } from '@xyflow/react'
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import { generateTicks } from '../functions/generateTicks'

const TrafficNode = ({ data }: { data: Record<string, any> }) => {
  const { bandwidth } = data
  const value = bandwidth || data._maxBandwidth
  const tooltipData = [{ name: '1', value }]

  const getColorForValue = (value: number) => {
    if (value > 2000) {
      return 'red'
    }
    else if (value > 1500) {
      return 'orange'
    }
    else if (value > 1000) {
      return 'blue'
    }
    else {
      return '#16a34a'
    }
  }

  const backgroundColor = getColorForValue(value)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <div
            className="relative group cursor-grab flex justify-center rounded-full"
            style={{
              minHeight: '10px',
              gap: '12px',
              alignItems: 'center',
              backgroundColor,
            }}
          >
            <TooltipContent side='bottom'>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                <div className="flex flex-col items-center">

                  <ResponsiveContainer height={70} width="100%">
                    <BarChart data={tooltipData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                      <XAxis
                        axisLine={{ stroke: '#333' }}
                        domain={[0, Math.ceil(value * 1.2)]}
                        tick={{ fontSize: 10, fill: '#333' }}
                        tickFormatter={(val: any) => val}
                        tickLine={{ stroke: '#333' }}
                        ticks={generateTicks(value)}
                        type="number"
                      />
                      <YAxis dataKey="name" hide={true} type="category" />
                      <Bar barSize={20} dataKey="value" fill="#60a5fa" radius={[4, 4, 4, 4]}>
                        <LabelList
                          dataKey="value"
                          formatter={(val: any) => val}
                          position="right"
                          style={{ fontSize: '12px', fill: '#333' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute w-3 h-3 bg-white border-b border-r border-gray-200 -bottom-1.5 left-1/2 -translate-x-1/2 transform rotate-45" />
              </div>
            </TooltipContent>
            <div
              className="relative transition-all duration-300 ease-in-out rounded-full "
              style={{
                width: `${data.width}px`,
                height: '36px',
                backgroundColor,
                border: `2px solid ${backgroundColor}`,
              }}
            >
              <Handle className="w-3 h-3 -left-1.5 border-2 bg-white" position={Position.Left} type="target" />
              <Handle className="w-3 h-3 -right-1.5 border-2 bg-white" position={Position.Right} type="source" />
            </div>
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TrafficNode
