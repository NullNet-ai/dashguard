'use client'

import * as React from 'react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { type ColorFormat } from './types'
import { formatColor } from './utils'
import {
  ColorPreview,
  ColorPickerArea,
  FormatSelector,
  ColorInputs
} from './components'
import { toast } from 'sonner'
// Lazy load ColorPresets component which might be heavy due to color palette data
const ColorPresets = React.lazy(() => import('./components/color-presets').then(module => ({ default: module.ColorPresets })))
import { useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { RecentColors } from './components/recent-colors'
import { ColorValueInput } from './components/color-value-input'
import { debounce } from 'lodash'
// Import debounce utility

// Props interface for the ColorPicker component
export interface ColorPickerProps {
  /**
   * Initial color value (default: Tailwind "slate-500")
   */
  defaultColor?: string

  /**
   * Default color format to display
   */
  format?: ColorFormat

  /**
   * Default alpha/opacity value (0-100)
   */
  defaultAlpha?: number

  /**
   * Callback when color changes
   */
  onColorChange?: (color: {
    value: string
    format: ColorFormat
    alpha?: number
    tailwindClass?: string
  }) => void

  /**
   * Additional class names
   */
  className?: string
}


export function ColorPicker({
  defaultColor = '#64748b', // Tailwind slate-500
  format = 'hex',
  defaultAlpha = 100,
  onColorChange,
  className
}: ColorPickerProps) {
  // State for the current color value
  const [color, setColor] = React.useState<string>(defaultColor)

  // State for the current color format
  const [activeFormat, setActiveFormat] = React.useState<ColorFormat>(format)

  // State for alpha/opacity value (0-100)
  const [alpha, setAlpha] = React.useState<number>(defaultAlpha)


  // State for the popover
  const [open, setOpen] = React.useState<boolean>(false)

  // State for eyedropper active status
  const [eyeDropperActive, setEyeDropperActive] = React.useState<boolean>(false)

  // State for showing tailwind color palette
  const [showTailwindPalette, setShowTailwindPalette] = React.useState<boolean>(false)

  // State for recent colors
  const [recentColors, setRecentColors] = React.useState<string[]>([])

  // Load recent colors from localStorage on component mount
  React.useEffect(() => {
    const savedColors = localStorage.getItem('recentColors')
    if (savedColors) {
      try {
        setRecentColors(JSON.parse(savedColors))
      } catch (e) {
        console.error('Failed to parse recent colors from localStorage', e)
      }
    }
  }, [])

  // Memoize the formatted color value to avoid unnecessary recalculations
  const formattedColor = useMemo(() =>
    formatColor(color, activeFormat, alpha),
    [color, activeFormat, alpha]
  )

  // State for tracking the displayed color value during editing
  const [displayedColor, setDisplayedColor] = React.useState<string>(formatColor(defaultColor, format))

  // Update displayed color when formatted color changes
  React.useEffect(() => {
    setDisplayedColor(formattedColor)
  }, [formattedColor])

  // Create a debounced version of the onColorChange callback
  const debouncedOnColorChange = React.useRef(
    debounce((params: {
      value: string,
      format: ColorFormat,
      tailwindClass?: string,
      alpha?: number,
    }) => {
      if (onColorChange) {
        onColorChange(params)
      }
    }, 50) // 50ms debounce delay
  ).current

  // Handle color change with debouncing
  const handleColorChange = React.useCallback((newColor: string) => {
    setColor(newColor)

    // Use the debounced callback
    debouncedOnColorChange({
      value: formatColor(newColor, activeFormat, alpha),
      format: activeFormat,
      alpha: alpha,
      // TODO: Add tailwind class detection
    })
  }, [activeFormat, debouncedOnColorChange, alpha])

  // Add color to recent colors when color picker is closed
  React.useEffect(() => {
    if (!open && color) {
      // Always store colors in hex format regardless of the current display format
      // This ensures consistency when retrieving colors later
      const hexColor = color.startsWith('#') ? color : formatColor(color, 'hex');
      
      // Only add the color if it's not already the most recent one
      setRecentColors(prev => {
        const newColors = prev.filter(c => c !== hexColor)
        // Add new color to the beginning and limit to 12 colors
        const updatedColors = [hexColor, ...newColors].slice(0, 12)
        // Save to localStorage
        localStorage.setItem('recentColors', JSON.stringify(updatedColors))
        return updatedColors
      })
    }
  }, [open, color])


  // Use useMediaQuery hook for responsive behavior
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' }) // 768px is typical md breakpoint

  // Handle format change
  const handleFormatChange = React.useCallback((newFormat: ColorFormat) => {
    setActiveFormat(newFormat)
    
    // Reset alpha to 100 when switching to hex format
    if (newFormat === 'hex' && alpha !== 100) {
      setAlpha(100)
    }

    // Update the color value in the new format
    debouncedOnColorChange({
      value: formatColor(color, newFormat, newFormat === 'hex' ? 100 : alpha),
      format: newFormat,
      alpha: newFormat === 'hex' ? 100 : alpha,
    })
  }, [color, debouncedOnColorChange, alpha])




  // Check if we're in a browser environment for EyeDropper support
  const isEyeDropperSupported = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      // More robust detection of EyeDropper API
      // @ts-expect-error - EyeDropper is not in the TypeScript DOM types yet
      return typeof window.EyeDropper === 'function' ||
        // @ts-expect-error - EyeDropper is not in the TypeScript DOM types yet
        (window.EyeDropper && typeof window.EyeDropper.prototype.open === 'function');
    } catch (e) {
      console.error('Error checking EyeDropper support:', e);
      return false;
    }
  }, []);

  // Handle eye dropper
  const handleEyeDropper = React.useCallback(async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    try {
      // More robust check for EyeDropper API availability
      if (!isEyeDropperSupported) {
        toast.error('Eye dropper is not supported in this browser', {
          richColors: true
        });
        return;
      }

      setEyeDropperActive(true);
      // @ts-expect-error - EyeDropper is not in the TypeScript DOM types yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      handleColorChange(result.sRGBHex);
    } catch (error) {
      console.error('Error using eye dropper:', error);
      // Show a more user-friendly error message
      if (error instanceof Error && error.name === 'AbortError') {
        // User canceled the eye dropper
        // console.log('Eye dropper was canceled');
      } else {
        toast.error('Failed to use the eye dropper tool', {
          richColors: true
        });
      }
    } finally {
      setEyeDropperActive(false);
    }
  }, [handleColorChange, isEyeDropperSupported]);

  // Memoize the color preview component to prevent unnecessary re-renders
  const colorPreviewComponent = useMemo(() => (
    <ColorPreview
      color={color}
      alpha={alpha}
    />
  ), [color, alpha]);

  // Memoize the color picker area and sliders
  const colorPickerComponents = useMemo(() => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Color Picker</label>
        <span className="text-xs text-muted-foreground">Click or drag to select</span>
      </div>

      <section className='flex gap-2 justify-around'>
        <ColorPickerArea
          color={color}
          onColorChange={handleColorChange}
          alpha={alpha}
          onAlphaChange={setAlpha}
          format={activeFormat}  // Pass the activeFormat
        />
      </section>
      
      <ColorInputs
        color={color}
        alpha={alpha}
        activeFormat={activeFormat}
        onColorChange={handleColorChange}
        onAlphaChange={setAlpha}
      />
      
      <ColorValueInput
        displayedColor={displayedColor}
        activeFormat={activeFormat}
        handleColorChange={handleColorChange}
        setDisplayedColor={setDisplayedColor}
        handleEyeDropper={handleEyeDropper}
        eyeDropperActive={eyeDropperActive}
        isEyeDropperSupported={isEyeDropperSupported}
        alpha={alpha}
        onAlphaChange={setAlpha}
      />
    </div>
  ), [color, handleColorChange, alpha, activeFormat, displayedColor, handleEyeDropper, eyeDropperActive, isEyeDropperSupported]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[220px] justify-start text-left font-normal", className)}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border border-input relative overflow-hidden"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' viewBox=\'0 0 8 8\'%3E%3Cpath fill-rule=\'evenodd\' clip-rule=\'evenodd\' d=\'M0 0h4v4H0V0zm4 4h4v4H4V4z\' fill=\'%23ddd\'/%3E%3C/svg%3E")',
                  backgroundSize: '8px 8px'
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color
                  }}
                />
              </div>
              <span>{displayedColor}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4">
          <div className="flex flex-col gap-4">
            {/* Color preview */}
            {colorPreviewComponent}

            {/* Recent colors component */}
            <RecentColors
              recentColors={recentColors}
              onColorSelect={handleColorChange}
              isDesktop={isDesktop}
              showTailwindPalette={showTailwindPalette}
              setShowTailwindPalette={setShowTailwindPalette}
              activeFormat={activeFormat}
            />

            {/* Tailwind color palette - only show on mobile when expanded */}
            {!isDesktop && showTailwindPalette && (
              <React.Suspense fallback={<div className="h-40 flex items-center justify-center">Loading color presets...</div>}>
                <ColorPresets
                  onColorSelect={handleColorChange}
                  isDesktop={false}
                  showInline={true}
                />
              </React.Suspense>
            )}

            {/* Custom hue and saturation picker */}
            {colorPickerComponents}

            {/* Format selector and color input */}
            <div className="space-y-3">
              <FormatSelector
                activeFormat={activeFormat}
                onFormatChange={handleFormatChange}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { ColorFormat }
