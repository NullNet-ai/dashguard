'use client'

import * as React from 'react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Pipette } from 'lucide-react'

interface EyedropperButtonProps {
  handleEyeDropper: () => void
  eyeDropperActive: boolean
  isEyeDropperSupported: boolean
}

export function EyedropperButton({
  handleEyeDropper,
  eyeDropperActive,
  isEyeDropperSupported
}: EyedropperButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9" 
          onClick={handleEyeDropper}
          disabled={eyeDropperActive || !isEyeDropperSupported}
        >
          <Pipette className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Pick Color</p>
      </TooltipContent>
    </Tooltip>
  )
}