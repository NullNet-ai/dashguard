'use client'

import * as React from 'react'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { tailwindColors } from '../tailwind-colors'

// Common colors that are frequently used in web design
const commonColors = {
  'Basic': {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#00ff00',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
  },
  'UI': {
    'success': '#22c55e', // green-500
    'warning': '#f59e0b', // amber-500
    'error': '#ef4444',   // red-500
    'info': '#3b82f6',    // blue-500
    'muted': '#6b7280',   // gray-500
  }
}

interface ColorPresetsProps {
  onColorSelect: (color: string) => void;
  isDesktop?: boolean;
  showInline?: boolean;
}

export function ColorPresets({ 
  onColorSelect, 
  showInline = false,
}: ColorPresetsProps) {
  // If we're showing inline (mobile view), render the content directly
  if (showInline) {
    return (
      <div className="space-y-4">
        {/* Common Colors Section */}
        <div className="space-y-3">
          <h5 className="text-xs font-medium">Common Colors</h5>
          <div className="space-y-3">
            {Object.entries(commonColors).map(([category, colors]) => (
              <div key={category} className="space-y-1">
                <div className="text-xs text-muted-foreground">{category}</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(colors).map(([colorName, hexValue]) => (
                    <Tooltip key={`${category}-${colorName}`}>
                      <TooltipTrigger asChild>
                        <button
                          className="h-5 w-5 rounded-md border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          style={{ backgroundColor: hexValue }}
                          onClick={() => onColorSelect(hexValue)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p className="capitalize">{colorName}</p>
                        <p className="text-muted-foreground">{hexValue}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-border" />
        
        {/* Tailwind Colors Section */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium">Tailwind Colors</h5>
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
            {Object.entries(tailwindColors).map(([colorName, shades]) => (
              <div key={colorName} className="space-y-1">
                <div className="text-xs font-medium capitalize">{colorName}</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(shades).map(([shade, hexValue]) => (
                    <Tooltip key={`${colorName}-${shade}`}>
                      <TooltipTrigger asChild>
                        <button
                          className="h-5 w-5 rounded-md border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          style={{ backgroundColor: hexValue }}
                          onClick={() => onColorSelect(hexValue)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{`${colorName}-${shade}`}</p>
                        <p className="text-muted-foreground">{hexValue}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Otherwise, render the popover (desktop view)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 px-2 text-xs"
        >
          More Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-3" 
        side="right"
        align="start"
        alignOffset={-135}
        sideOffset={20}
        onInteractOutside={(e) => {
          // Prevent this event from closing the parent popover
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Prevent clicks from bubbling up to parent popover
          e.stopPropagation();
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Color Presets</h4>
          </div>
          
          {/* Common Colors Section */}
          <div className="space-y-3">
            <h5 className="text-xs font-medium">Common Colors</h5>
            <div className="space-y-3">
              {Object.entries(commonColors).map(([category, colors]) => (
                <div key={category} className="space-y-1">
                  <div className="text-xs text-muted-foreground">{category}</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(colors).map(([colorName, hexValue]) => (
                      <Tooltip key={`${category}-${colorName}`}>
                        <TooltipTrigger asChild>
                          <button
                            className="size-8 rounded-full border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ backgroundColor: hexValue }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onColorSelect(hexValue);
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          <p className="capitalize">{colorName}</p>
                          <p className="text-muted-foreground">{hexValue}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-border" />
          
          {/* Tailwind Colors Section */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium">Tailwind Colors</h5>
            <div className="space-y-3 max-h-[262px] overflow-y-auto px-1">
              {Object.entries(tailwindColors).map(([colorName, shades]) => (
                <div key={colorName} className="space-y-1">
                  <div className="text-xs font-medium capitalize">{colorName}</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(shades).map(([shade, hexValue]) => (
                      <Tooltip key={`${colorName}-${shade}`}>
                        <TooltipTrigger asChild>
                          <button
                            className="size-8 rounded-full border border-input overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            style={{ backgroundColor: hexValue }}
                            onClick={(e) => {
                              // Prevent event from bubbling up
                              e.stopPropagation();
                              onColorSelect(hexValue);
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          <p>{`${colorName}-${shade}`}</p>
                          <p className="text-muted-foreground">{hexValue}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}