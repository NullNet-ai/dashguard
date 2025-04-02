import React, { useRef } from 'react'
import { getHue, getSaturation, getLightness, hslToHex } from '../utils'

interface HueSliderProps {
  color: string
  onColorChange: (color: string) => void
}

export function HueSlider({ color, onColorChange }: HueSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleHueChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    
    // Get clientX based on event type
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : ('clientX' in e ? e.clientX : 0)
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    
    const h = Math.round(x * 360)
    const s = getSaturation(color)
    const l = getLightness(color)
    
    const newColor = hslToHex(h, s, l)
    onColorChange(newColor)
  }
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Handle the initial click
    handleHueChange(e)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleHueChange(e)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleHueChange(e)
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
    handleHueChange(e)
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleHueChange(e)
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    // Add event listeners for dragging
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }
  
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">Hue</label>
      <div className="relative h-6 w-full rounded-md border border-input">
        <div 
          ref={containerRef}
          className="absolute inset-0 rounded-md touch-none" 
          style={{ 
            background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' 
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
        
        {/* Hue slider indicator */}
        <div 
          className="absolute top-0 -ml-1 h-full w-2 rounded-sm border border-white bg-white shadow-sm pointer-events-none"
          style={{ left: `${getHue(color) / 360 * 100}%` }}
        />
      </div>
    </div>
  )
}