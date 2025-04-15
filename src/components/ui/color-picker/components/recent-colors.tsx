'use client'

import * as React from 'react'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { ColorPresets } from './color-presets'
import { type ColorFormat } from '../types'

interface RecentColorsProps {
  recentColors: string[]
  onColorSelect: (color: string) => void
  isDesktop: boolean
  showTailwindPalette: boolean
  setShowTailwindPalette: (show: boolean) => void
  activeFormat: ColorFormat
}

export function RecentColors({
  recentColors,
  onColorSelect,
  isDesktop,
  showTailwindPalette,
  setShowTailwindPalette,
}: RecentColorsProps) {
  // State to control the "more colors" popover
  const [moreColorsOpen, setMoreColorsOpen] = React.useState(false)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Recent Colors</label>
        {!isDesktop ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={() => setShowTailwindPalette(!showTailwindPalette)}
          >
            {showTailwindPalette ? "Hide Presets" : "More Colors"}
          </Button>
        ) : (
          <ColorPresets 
            onColorSelect={onColorSelect}
            isDesktop={true}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {recentColors.slice(0, 6).map((recentColor, index) => (
          <Tooltip key={`${recentColor}-${index}`}>
            <TooltipTrigger asChild>
              <button
                className="h-6 w-6 rounded-full border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                style={{ 
                  backgroundColor: recentColor,
                }}
                onClick={() => onColorSelect(recentColor)}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p className="text-muted-foreground">{recentColor}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {recentColors.length > 6 && (
          <Popover open={moreColorsOpen} onOpenChange={setMoreColorsOpen}>
            <PopoverTrigger asChild>
              <button
                className="h-6 w-6 rounded-full border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-muted flex items-center justify-center text-xs"
                title="More recent colors"
              >
                +{recentColors.length - 6}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[205px] p-2">
              <div className="flex flex-wrap gap-2">
                {recentColors.slice(6).map((recentColor, index) => (
                  <Tooltip key={`${recentColor}-${index}`}>
                    <TooltipTrigger asChild>
                      <button
                        className="h-6 w-6 rounded-full border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        style={{ 
                          backgroundColor: recentColor,
                        }}
                        onClick={() => {
                          onColorSelect(recentColor)
                          setMoreColorsOpen(false) // Close popover after selection
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p className="text-muted-foreground">{recentColor}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}