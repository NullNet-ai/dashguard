import React from 'react'

interface ColorPreviewProps {
  color: string
  alpha: number
}

export function ColorPreview({ color, alpha }: ColorPreviewProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Preview</label>
        <span className="text-xs text-muted-foreground">Current color</span>
      </div>
      <div 
        className="h-20 w-full rounded-md border border-input relative overflow-hidden"
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'%3E%3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M0 0h4v4H0V0zm4 4h4v4H4V4z\' fill=\'%23ddd\'/%3E%3C/svg%3E")',
          backgroundSize: '8px 8px'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: color,
            opacity:  alpha / 100 
          }}
        />
      </div>
    </div>
  )
}