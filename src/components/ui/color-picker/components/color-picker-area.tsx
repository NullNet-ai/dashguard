import React, { useState, useEffect } from 'react'
import {
  type HsvaColor,
  hexToHsva,
  hsvaToHex,
} from '@uiw/color-convert'
import Chrome from '@uiw/react-color-chrome'
import { ColorFormat } from '../types'

interface ColorPickerAreaProps {
  color: string
  onColorChange: (color: string) => void
  alpha?: number
  onAlphaChange?: (alpha: number) => void
  format?: ColorFormat  // Add format prop
}

export function ColorPickerArea({ 
  color, 
  onColorChange,
  alpha = 100,
  onAlphaChange,
  format = 'hex'  // Default to hex
}: ColorPickerAreaProps) {
  // Convert initial color to hsva and maintain state
  const [hsva, setHsva] = useState<HsvaColor>(() => {
    try {
      const converted = hexToHsva(color)
      // Set alpha from props
      if (onAlphaChange) {
        converted.a = alpha / 100
      }
      return converted
    } catch (e) {
      console.error('Error converting color:', e)
      return { h: 0, s: 25.71, v: 82.35, a: alpha / 100 }
    }
  })
  
  // Update hsva when color prop changes from outside
  useEffect(() => {
    try {
      if (color.startsWith('#')) {
        const newHsva = hexToHsva(color)
        // Preserve alpha value when color changes
        if (onAlphaChange) {
          newHsva.a = alpha / 100
        }
        setHsva(newHsva)
      }
    } catch (e) {
      console.error('Error updating from color prop:', e)
    }
  }, [color, alpha, onAlphaChange])

  // Handle color change from the Chrome picker
  const handleColorChange = (colorResult: { hsva: HsvaColor }) => {
    const newHsva = { ...colorResult.hsva }
    
    // Force alpha to 1 for hex format
    if (format === 'hex') {
      newHsva.a = 1
    }
    
    setHsva(newHsva)
    
    // Update the hex color
    const hexColor = hsvaToHex(newHsva)
    onColorChange(hexColor)
    
    // Only update alpha for non-hex formats
    if (onAlphaChange && format !== 'hex') {
      const newAlpha = Math.round(colorResult.hsva.a * 100)
      onAlphaChange(newAlpha)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Chrome
        color={hsva}
        onChange={handleColorChange}
        showAlpha={format !== 'hex'} // Only hide alpha slider for hex format
        showColorPreview={false}
        showEditableInput={false}
        style={{
          boxShadow: 'none',
          borderRadius: '0.375rem',
          border: '1px solid var(--input)',
        }}
      />
    </div>
  )
}