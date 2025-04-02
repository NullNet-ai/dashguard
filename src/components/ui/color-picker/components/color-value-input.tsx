'use client'

import * as React from 'react'
import { type ColorFormat } from '../types'
import { EyedropperButton } from './eyedropper-button'
import { CopyButton } from './copy-button'

interface ColorValueInputProps {
  displayedColor: string
  activeFormat: ColorFormat
  handleColorChange: (color: string) => void
  setDisplayedColor: (color: string) => void
  copyToClipboard: () => void
  handleEyeDropper: () => void
  eyeDropperActive: boolean
  isEyeDropperSupported: boolean
  copied: boolean
}

export function ColorValueInput({
  displayedColor,
  activeFormat,
  handleColorChange,
  setDisplayedColor,
  copyToClipboard,
  handleEyeDropper,
  eyeDropperActive,
  isEyeDropperSupported,
  copied
}: ColorValueInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">Color Value</label>
        <span className="text-xs text-muted-foreground">
          {activeFormat === 'hex' ? '' : ''}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={displayedColor}
            onChange={(e) => {
              // Only allow editing for HEX format
              if (activeFormat === 'hex') {
                let newValue = e.target.value;
                
                // Add # prefix if missing
                if (!newValue.startsWith('#') && newValue.length > 0) {
                  newValue = '#' + newValue;
                }
                
                // Allow empty input or valid hex characters
                if (newValue === '' || newValue === '#' || /^#[0-9A-Fa-f]{0,8}$/.test(newValue)) {
                  // If we have a valid hex color (at least #RRGGBB format), update the color
                  if (newValue.length >= 7) {
                    handleColorChange(newValue);
                  } 
                  // For shorter inputs, just update the display value without changing the actual color
                  else {
                    // Force a re-render to show the current input
                    setDisplayedColor(newValue);
                  }
                }
              }
            }}
            readOnly={activeFormat !== 'hex'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <EyedropperButton 
          handleEyeDropper={handleEyeDropper}
          eyeDropperActive={eyeDropperActive}
          isEyeDropperSupported={isEyeDropperSupported}
        />
        
        <CopyButton 
          copyToClipboard={copyToClipboard}
          copied={copied}
        />
      </div>
    </div>
  )
}