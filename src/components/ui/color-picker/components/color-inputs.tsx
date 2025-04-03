import React from 'react'
import { type ColorFormat } from '../types'
import { getHue, getSaturation, getLightness, hslToHex } from '../utils'

interface ColorInputsProps {
  color: string
  alpha: number
  activeFormat: ColorFormat
  onColorChange: (color: string) => void
  onAlphaChange: (alpha: number) => void
}

export function ColorInputs({ 
  color, 
  alpha, 
  activeFormat, 
  onColorChange, 
  onAlphaChange 
}: ColorInputsProps) {
  // Only show inputs for rgb and hsl formats
  if (activeFormat !== 'rgb' && activeFormat !== 'hsl') {
    return null
  }
  
  return (
    <div className="flex items-center gap-2">
      {activeFormat === 'rgb' && (
        <>
          <div className="grid grid-cols-3 gap-2 flex-1">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">R</label>
              <input
                type="number"
                min="0"
                max="255"
                value={parseInt(color.slice(1, 3), 16)}
                onChange={(e) => {
                  const r = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  const g = parseInt(color.slice(3, 5), 16)
                  const b = parseInt(color.slice(5, 7), 16)
                  const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
                  onColorChange(newColor)
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            {/* Rest of RGB inputs remain unchanged */}
          </div>
          <div className="flex flex-col w-16">
            <label className="text-xs text-muted-foreground mb-1">Alpha</label>
            <input
              type="number"
              min="0"
              max="100"
              value={alpha}
              onChange={(e) => {
                const newAlpha = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                onAlphaChange(newAlpha)
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </>
      )}
      
      {/* HSL inputs remain unchanged */}
    </div>
  )
}