'use client'

import { CheckIcon, ClipboardIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { type ColorFormat } from '../types'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useState } from 'react'

// Remove copied from interface
interface ColorValueInputProps {
  displayedColor: string
  activeFormat: ColorFormat
  handleColorChange: (color: string) => void
  setDisplayedColor: (color: string) => void
  handleEyeDropper: () => void
  eyeDropperActive: boolean
  isEyeDropperSupported: boolean
  alpha?: number
  onAlphaChange?: (alpha: number) => void
}

export function ColorValueInput({
  displayedColor,
  activeFormat,
  handleColorChange,
  setDisplayedColor,
  alpha = 100,
  onAlphaChange,
}: ColorValueInputProps) {
  const [copied, setCopied] = useState(false)

  // Update displayed color when alpha changes for formats that support alpha
  useEffect(() => {
    if (!onAlphaChange) return;
    
    // Only update if we have a valid alpha and it's not already in the displayed color
    if (alpha !== undefined && alpha !== 100) {
      if (activeFormat === 'hex' && displayedColor.length === 7) {
        // Convert alpha percentage to hex
        const alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
        setDisplayedColor(`${displayedColor}${alphaHex}`);
      } else if (activeFormat === 'rgb' && displayedColor.startsWith('rgb(')) {
        // Convert rgb() to rgba()
        const rgbValues = displayedColor.replace('rgb(', '').replace(')', '');
        setDisplayedColor(`rgba(${rgbValues}, ${alpha / 100})`);
      } else if (activeFormat === 'hsl' && displayedColor.startsWith('hsl(')) {
        // Convert hsl() to hsla()
        const hslValues = displayedColor.replace('hsl(', '').replace(')', '');
        setDisplayedColor(`hsla(${hslValues}, ${alpha / 100})`);
      }
    }
  }, [alpha, activeFormat, displayedColor, onAlphaChange, setDisplayedColor]);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Input
          value={displayedColor}
          onChange={(e) => {
            setDisplayedColor(e.target.value)

            // Only update the actual color if it's a valid format
            if (activeFormat === 'hex') {
              // Handle standard 6-digit hex
              if (/^#[0-9A-Fa-f]{6}$/i.test(e.target.value)) {
                handleColorChange(e.target.value)
                // Reset alpha to 100% if we're switching from 8-digit to 6-digit hex
                if (onAlphaChange && alpha !== 100) {
                  onAlphaChange(100);
                }
              } 
              // Handle 8-digit hex with alpha
              else if (/^#[0-9A-Fa-f]{8}$/i.test(e.target.value)) {
                // Extract the alpha value from the hex
                const alphaHex = e.target.value.slice(7, 9)
                const alphaDecimal = parseInt(alphaHex, 16)
                const alphaPercent = Math.round((alphaDecimal / 255) * 100)
                
                // Update alpha if handler is provided
                if (onAlphaChange) {
                  onAlphaChange(alphaPercent)
                }
                
                // Update color (first 7 characters of the hex)
                handleColorChange(e.target.value.slice(0, 7))
              }
              // For hex format, try to update as user types if it's a valid partial hex
              else if (e.target.value.startsWith('#') && 
                  /^#[0-9A-Fa-f]{0,8}$/i.test(e.target.value)) {
                if (e.target.value.length >= 7) {
                  handleColorChange(e.target.value.slice(0, 7))
                  
                  // If we have alpha digits (8-digit hex)
                  if (e.target.value.length > 7 && onAlphaChange) {
                    const alphaHex = e.target.value.slice(7).padEnd(2, '0')
                    const alphaDecimal = parseInt(alphaHex, 16)
                    const alphaPercent = Math.round((alphaDecimal / 255) * 100)
                    onAlphaChange(alphaPercent)
                  }
                }
              }
            } else if (activeFormat === 'rgb' && /^rgba?\(.*\)$/i.test(e.target.value)) {
              handleColorChange(e.target.value)
              
              // Extract alpha from rgba if present
              if (e.target.value.startsWith('rgba') && onAlphaChange) {
                const match = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/.exec(e.target.value)
                if (match && match[1]) {
                  const alphaDecimal = parseFloat(match[1])
                  const alphaPercent = Math.round(alphaDecimal * 100)
                  onAlphaChange(alphaPercent)
                }
              } else if (e.target.value.startsWith('rgb') && onAlphaChange && alpha !== 100) {
                // Reset alpha to 100% if we're switching from rgba to rgb
                onAlphaChange(100);
              }
            } else if (activeFormat === 'hsl' && /^hsla?\(.*\)$/i.test(e.target.value)) {
              handleColorChange(e.target.value)
              
              // Extract alpha from hsla if present
              if (e.target.value.startsWith('hsla') && onAlphaChange) {
                const match = /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*([\d.]+)\s*\)/.exec(e.target.value)
                if (match && match[1]) {
                  const alphaDecimal = parseFloat(match[1])
                  const alphaPercent = Math.round(alphaDecimal * 100)
                  onAlphaChange(alphaPercent)
                }
              } else if (e.target.value.startsWith('hsl') && onAlphaChange && alpha !== 100) {
                // Reset alpha to 100% if we're switching from hsla to hsl
                onAlphaChange(100);
              }
            } else if (activeFormat === 'oklch' && /^oklch\(.*\)$/i.test(e.target.value)) {
              handleColorChange(e.target.value)
              
              // Extract alpha from oklch if present
              if (e.target.value.includes('/') && onAlphaChange) {
                const match = /oklch\(.*\/\s*([\d.]+)\s*\)/.exec(e.target.value)
                if (match && match[1]) {
                  const alphaDecimal = parseFloat(match[1])
                  const alphaPercent = Math.round(alphaDecimal * 100)
                  onAlphaChange(alphaPercent)
                }
              }
            }
          }}
          className="pr-16"
        />
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={async (e) => {
              e.preventDefault()
              try {
                await navigator.clipboard.writeText(displayedColor)
                setCopied(true)
                toast.success('Color copied to clipboard')
                setTimeout(() => setCopied(false), 2000)
              } catch (err) {
                console.error('Failed to copy color to clipboard', err)
                toast.error('Failed to copy color')
              }
            }}
            title="Copy color"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Copy color</span>
          </Button>
        </div>
      </div>
    </div>
  )
}