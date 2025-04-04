import { type ColorFormat } from './types'
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

export function formatColor(color: string, format: ColorFormat, alpha?: number): string {
  if (!color) return '';
  
  try {
    switch (format) {
      case 'hex':
        // If alpha is provided and not 100%, add it to the hex
        if (alpha !== undefined && alpha < 100) {
          const alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
          return `${color}${alphaHex}`;
        }
        return color;
      
      case 'rgb': {
        // Convert hex to rgb
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // If alpha is provided and not 100%, use rgba format
        if (alpha !== undefined && alpha < 100) {
          return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      case 'hsl': {
        // Convert hex to hsl
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          
          h = Math.round(h * 60);
        }
        
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        // If alpha is provided and not 100%, use hsla format
        if (alpha !== undefined && alpha < 100) {
          return `hsla(${h}, ${s}%, ${l}%, ${alpha / 100})`;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
      
      // Add other formats as needed
      
      default:
        return color;
    }
  } catch (e) {
    console.error('Error formatting color:', e);
    return color;
  }
}
