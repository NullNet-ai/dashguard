import React, { useRef } from 'react'
import { getHue, hslToHex } from '../utils'

interface ColorPickerAreaProps {
  color: string
  onColorChange: (color: string) => void
}

export function ColorPickerArea({ color, onColorChange }: ColorPickerAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleSaturationChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    
    // Get clientX and clientY based on event type
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : ('clientX' in e ? e.clientX : 0)
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : ('clientY' in e ? e.clientY : 0)
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    
    const h = getHue(color)
    const s = Math.round(x * 100)
    const l = Math.round(y * 50) // Limit lightness to 50% max for better colors
    
    const newColor = hslToHex(h, s, l)
    onColorChange(newColor)
  }
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Handle the initial click
    handleSaturationChange(e)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleSaturationChange(e)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleSaturationChange(e)
    }
    
    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
    }
    
    // Add event listeners for dragging
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
  }
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Handle the initial touch
    handleSaturationChange(e)
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleSaturationChange(e)
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    // Add event listeners for dragging
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }
  
  // Calculate saturation and lightness for the indicator position
  const saturation = Math.max(0, Math.min(100, getSaturation(color)))
  const lightness = Math.max(0, Math.min(100, getLightness(color)))
  
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-md border border-input">
      {/* Saturation/Value area */}
      <div 
        className="absolute inset-0" 
        style={{ 
          background: `linear-gradient(to right, #fff, hsl(${getHue(color)}, 100%, 50%))` 
        }}
      />
      <div 
        ref={containerRef}
        className="absolute inset-0 touch-none" 
        style={{ 
          background: 'linear-gradient(to top, #000, transparent)' 
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      
      {/* Current color position indicator */}
      <div 
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm pointer-events-none"
        style={{ 
          left: `${saturation}%`, 
          top: `${100 - lightness * 2}%` 
        }}
      />
    </div>
  )
}

// Helper function to get saturation from a hex color
function getSaturation(hexColor: string): number {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  
  if (max === min) {
    return 0
  }
  
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  
  return Math.round(s * 100)
}

// Helper function to get lightness from a hex color
function getLightness(hexColor: string): number {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  
  return Math.round(l * 100)
}