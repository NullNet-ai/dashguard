import React, { useRef } from 'react'

interface AlphaSliderProps {
  color: string
  alpha: number
  onAlphaChange: (alpha: number) => void
}

export function AlphaSlider({ color, alpha, onAlphaChange }: AlphaSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleAlphaChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    
    // Get clientX based on event type
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : ('clientX' in e ? e.clientX : 0)
    
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    
    const newAlpha = Math.round(x * 100)
    onAlphaChange(newAlpha)
  }
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Handle the initial click
    handleAlphaChange(e)
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleAlphaChange(e)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleAlphaChange(e)
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
    handleAlphaChange(e)
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleAlphaChange(e)
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
      <label className="text-xs text-muted-foreground">Opacity ({alpha}%)</label>
      <div className="relative h-6 w-full rounded-md border border-input">
        <div 
          className="absolute inset-0 rounded-md"
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'%3E%3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M0 0h4v4H0V0zm4 4h4v4H4V4z\' fill=\'%23ddd\'/%3E%3C/svg%3E")',
            backgroundSize: '8px 8px'
          }}
        />
        <div 
          className="absolute inset-0 rounded-md"
          style={{
            background: `linear-gradient(to right, transparent, ${color})`
          }}
        />
        <div 
          ref={containerRef}
          className="absolute inset-0 rounded-md touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
        
        {/* Alpha slider indicator */}
        <div 
          className="absolute top-0 -ml-1 h-full w-2 rounded-sm border border-white bg-white shadow-sm pointer-events-none"
          style={{ left: `${alpha}%` }}
        />
      </div>
    </div>
  )
}