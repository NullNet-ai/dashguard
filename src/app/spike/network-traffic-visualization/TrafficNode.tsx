import { Handle, Position } from '@xyflow/react'
import { useState } from 'react'
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const TrafficNode = ({ data }: { data: Record<string, any> }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const value = data._maxBandwidth
  const tooltipData = [{ name: '1', value }]

  const generateTicks = (value: number) => {
    const maxValue = Math.ceil(value * 1.2)
    const tickCount = 5
    return Array.from({ length: tickCount + 1 }, (_, i) => (maxValue / tickCount) * i)
  }

  const minOpacity = 0.2
  const maxOpacity = 1.0
  const minBandwidth = 10
  const maxBandwidth = 2500

  const normalizedValue = Math.min(1, Math.max(0, (value - minBandwidth) / (maxBandwidth - minBandwidth)))
  const opacity = minOpacity + (maxOpacity - minOpacity) * normalizedValue

  return (
    <div
      className="relative group cursor-grab"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
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
      )}

      <div
        className="relative transition-all duration-300 ease-in-out"
        style={{
          width: `${Math.max(50, data.width || 100)}px`,
          height: '36px',
          backgroundColor: `rgba(239, 68, 68, ${opacity})`,
          borderRadius: '6px',
          border: '2px solid rgb(239, 68, 68)',
        }}
      >
        <Handle className="w-3 h-3 -left-1.5 border-2 bg-white" position={Position.Left} type="target" />
        <Handle className="w-3 h-3 -right-1.5 border-2 bg-white" position={Position.Right} type="source" />
      </div>
    </div>
  )
}

export default TrafficNode
