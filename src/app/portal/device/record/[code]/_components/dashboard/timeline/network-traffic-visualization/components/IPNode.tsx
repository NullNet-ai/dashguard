import { Handle, Position } from '@xyflow/react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

const IPNode = ({ data }: { data: Record<string, any> }) => {
  return (

    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <div
            className="relative"
          >
            {/* {showTooltip && ( */}
            <TooltipContent side='bottom'>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">IP Address:</span>
                    <span className="text-gray-800">{data.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Country:</span>
                    <span className="text-gray-800">{data.country || 'Philippines'}</span>
                  </div>
                </div>
                <div className="absolute w-3 h-3 bg-white border-b border-r border-gray-200 -bottom-1.5 left-1/2 -translate-x-1/2 transform rotate-45" />
              </div>
              {/* )} */}
            </TooltipContent>
            <div
              className={`rounded-lg border-2 p-4 text-sm font-medium shadow-md ${
                data.type === 'source' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'
              } text-gray-800`}
            >
              {/* {data.label} */}
              <span
                style={{
                  fontSize: '25px',
                  color: 'black',
                }}
              >
                {data.label}
              </span>
              {/* <Handle position={Position.Right} type="source" />
              <Handle position={Position.Left} type="target" /> */}
            </div>
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}

export default IPNode
