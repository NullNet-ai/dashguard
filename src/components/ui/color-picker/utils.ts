import { type ColorFormat } from './types'

// Format color based on the selected format
export const formatColor = (hexColor: string, format: ColorFormat, alphaValue?: number): string => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  // Alpha value as decimal (0-1)
  const a = alphaValue !== undefined ? alphaValue / 100 : undefined
  
  switch (format) {
    case 'rgb':
      return a !== undefined 
        ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
        : `rgb(${r}, ${g}, ${b})`
    case 'hsl': {
      // Convert RGB to HSL
      const r1 = r / 255
      const g1 = g / 255
      const b1 = b / 255
      
      const max = Math.max(r1, g1, b1)
      const min = Math.min(r1, g1, b1)
      let h = 0, s = 0, l = (max + min) / 2
      
      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r1:
            h = (g1 - b1) / d + (g1 < b1 ? 6 : 0)
            break
          case g1:
            h = (b1 - r1) / d + 2
            break
          case b1:
            h = (r1 - g1) / d + 4
            break
        }
        
        h = Math.round(h * 60)
      }
      
      s = Math.round(s * 100)
      l = Math.round(l * 100)
      
      return a !== undefined
        ? `hsla(${h}, ${s}%, ${l}%, ${a.toFixed(2)})`
        : `hsl(${h}, ${s}%, ${l}%)`
    }
    case 'oklch': {
      // Simple conversion to OKLCH (not accurate, just for display)
      // A proper conversion would require a color library
      return a !== undefined
        ? `oklch(${(r / 255 * 0.5 + 0.3).toFixed(2)} ${(g / 255 * 0.2).toFixed(2)} ${(b / 255 * 360).toFixed(0)}deg / ${a.toFixed(2)})`
        : `oklch(${(r / 255 * 0.5 + 0.3).toFixed(2)} ${(g / 255 * 0.2).toFixed(2)} ${(b / 255 * 360).toFixed(0)}deg)`
    }
    case 'hex':
    default:
      return a !== undefined && a < 100
        ? `${hexColor}${Math.round(a / 100 * 255).toString(16).padStart(2, '0')}`
        : hexColor
  }
}

// Get hue from hex color
export function getHue(hexColor: string): number {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  
  if (max !== min) {
    const d = max - min
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    
    h = Math.round(h * 60)
  }
  
  return h
}

// Get saturation from hex color
export function getSaturation(hexColor: string): number {
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

// Get lightness from hex color
export function getLightness(hexColor: string): number {
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  
  return Math.round(l * 100)
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }
  
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')
  
  return `#${rHex}${gHex}${bHex}`
}