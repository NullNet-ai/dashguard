// Color format types
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

// RGB color type
export interface RGBColor {
  r: number
  g: number
  b: number
  a?: number
}

// HSL color type
export interface HSLColor {
  h: number
  s: number
  l: number
  a?: number
}

// OKLCH color type
export interface OKLCHColor {
  l: number
  c: number
  h: number
  a?: number
}

// Tailwind color info type
export interface TailwindColorInfo {
  palette: string
  shade: string
  className: string
}

// Color value type
export interface ColorValue {
  hex: string
  rgb: RGBColor
  hsl: HSLColor
  oklch: OKLCHColor
  tailwind?: TailwindColorInfo
}