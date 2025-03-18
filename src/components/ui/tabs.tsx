'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '~/lib/utils'

const Tabs = TabsPrimitive.Root
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'pills' | 'underline' | 'shadow'
    orientation?: 'horizontal' | 'vertical'
    position?: 'left' | 'right'
  }
>(
  (
    { className, variant = 'default', orientation = 'horizontal', position = 'right', ...props },
    ref
  ) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        {
          ' border-gray-200': !['pills', 'shadow'].includes(variant) && !(variant === 'underline' && orientation === 'vertical'),
          'border-b border-gray-200': variant === 'underline' && orientation === 'horizontal',
          'border-r border-gray-200': variant === 'underline' && orientation === 'vertical' && position === 'right',
          'border-l border-gray-200': variant === 'underline' && orientation === 'vertical' && position === 'left',
          'rounded-lg bg-gray-50 p-1': variant === 'pills',
          'shadow-lg': variant === 'shadow',
        },
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    iconPosition?: 'left' | 'right'
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'pills' | 'underline' | 'shadow'
    rotateText?: boolean
    position?: 'left' | 'right'
  }
>(
  (
    {
      className,
      iconPosition = 'left',
      size = 'md',
      variant = 'default',
      rotateText = false,
      position = 'right',
      ...props
    },
    ref
  ) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center whitespace-nowrap transition-all',
        // Remove the default gap-2 and let it be controlled by the className
        {
          // Size variants - swap padding x and y when rotateText is true
          'px-3 py-1 text-xs': size === 'sm' && !rotateText,
          'px-4 py-1.5 text-sm': size === 'md' && !rotateText,
          'px-6 py-2 text-base': size === 'lg' && !rotateText,
          
          // Rotated text padding (swapped x and y)
          'py-3 px-1 text-xs': size === 'sm' && rotateText,
          'py-4 px-1.5 text-sm': size === 'md' && rotateText,
          'py-6 px-2 text-base': size === 'lg' && rotateText,

          // Style variants for horizontal orientation or non-rotated text
          'border-b-[3px] border-transparent hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600':
            ['default', 'shadow'].includes(variant) && (!rotateText || (rotateText && !position)),

          // Style variants for rotated text in vertical orientation
          'border-r-[3px] border-transparent hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600':
            ['default', 'shadow'].includes(variant) && rotateText && position === 'right',
          'border-l-[3px] border-transparent hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600':
            ['default', 'shadow'].includes(variant) && rotateText && position === 'left',

          // Pills variant - added box-border to maintain consistent sizing
          'rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 data-[state=active]:bg-[#6366F1] data-[state=active]:text-white box-border':
            variant === 'pills',

          // Underline variant for horizontal or non-rotated - added box-border and border-b-2 with transparent default
          'box-border border-b-2 border-transparent text-gray-500 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-0.5 data-[state=active]:after:w-full data-[state=active]:after:bg-blue-500':
            variant === 'underline' && (!rotateText || (rotateText && !position)),

          // Underline variant for rotated text - added box-border and appropriate transparent borders
          'box-border border-r-2 border-transparent text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:top-0 data-[state=active]:after:h-full data-[state=active]:after:w-0.5 data-[state=active]:after:bg-blue-500':
            variant === 'underline' && rotateText && position === 'right',
          'box-border border-l-2 border-transparent text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:after:absolute data-[state=active]:after:right-0 data-[state=active]:after:top-0 data-[state=active]:after:h-full data-[state=active]:after:w-0.5 data-[state=active]:after:bg-blue-500':
            variant === 'underline' && rotateText && position === 'left',

          // Shadow variant - added box-border
          'box-border border-transparent hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600':
            variant === 'shadow',

          // Icon positioning - add gap only when there's both icon and text
          'flex-row-reverse': iconPosition === 'right',
          'justify-center': true, // Always center content
        },

        className
      )}
      {...props}
    />
  )
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('', className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
