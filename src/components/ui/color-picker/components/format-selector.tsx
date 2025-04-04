import React from 'react'
import { type ColorFormat } from '../types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

interface FormatSelectorProps {
  activeFormat: ColorFormat
  onFormatChange: (format: ColorFormat) => void
}

export function FormatSelector({ activeFormat, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Color Format</label>
      <Select 
        value={activeFormat} 
        onValueChange={(value) => onFormatChange(value as ColorFormat)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hex">
            <div className="flex items-center justify-between w-full">
              <span>HEX</span>
              <span className="text-xs text-muted-foreground ml-2">#RRGGBB[AA]</span>
            </div>
          </SelectItem>
          <SelectItem value="rgb">
            <div className="flex items-center justify-between w-full">
              <span>RGB</span>
              <span className="text-xs text-muted-foreground ml-2">rgba(R, G, B, [A])</span>
            </div>
          </SelectItem>
          <SelectItem value="hsl">
            <div className="flex items-center justify-between w-full">
              <span>HSL</span>
              <span className="text-xs text-muted-foreground ml-2">hsla(H, S%, L%, [A])</span>
            </div>
          </SelectItem>
    
        </SelectContent>
      </Select>
    </div>
  )
}