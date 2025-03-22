import { Handle, Position } from '@xyflow/react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

import moment from 'moment-timezone';

const TrafficNode = ({ data }: { data: Record<string, any> }) => {

  const { bandwidth , bucket} = data
  const value = bandwidth || data._maxBandwidth

  const getColorForValue = (value: number) => {
    if (value > 100000) {
      return 'red'
    }
    else if (value > 50000) {
      return 'orange'
    }
    
    else if (value > 10000) {
      return 'blue'
    }
    else if (value > 1000) {
      return 'gray'
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
              <div className='text-lg'>
            {moment(bucket).format("HH:00:00")}

              </div>
              <div className='text-lg'>

              Total Bandwidth: {value}
              </div>
                    
            </TooltipContent>
            <div
              className="relative transition-all duration-300 ease-in-out rounded-full "
              style={{
                width: `${data.widthPixels}px`,
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
