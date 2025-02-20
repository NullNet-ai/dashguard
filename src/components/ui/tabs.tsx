'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '~/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'pills' | 'underline'|'shadow'
    orientation?: 'horizontal' | 'vertical'
  }
>(
  (
    { className, variant = 'default', orientation = 'horizontal', ...props },
    ref
  ) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        {
          'border-b border-gray-200': !['pills', 'shadow'].includes(variant),
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
  }
>(
  (
    {
      className,
      iconPosition = 'left',
      size = 'md',
      variant = 'default',
      ...props
    },
    ref
  ) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all',
        {
          // Size variants
          'px-3 py-1 text-xs': size === 'sm',
          'px-4 py-1.5 text-sm': size === 'md',
          'px-6 py-2 text-base': size === 'lg',

          // Style variants
          'border-b-[3px] border-transparent hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600':
            variant === 'default',
          'rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 data-[state=active]:bg-[#6366F1] data-[state=active]:text-white':
            variant === 'pills',
          'text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:h-0.5 data-[state=active]:after:w-full data-[state=active]:after:bg-blue-500':
            variant === 'underline',

          '  border-transparent border-b-[3px] hover:border-gray-300 hover:text-gray-700 data-[state=active]:border-blue-500 data-[state=active]:border-b-primary    data-[state=active]:text-blue-600':
            variant === 'shadow',

          // Icon positioning
          'flex-row-reverse': iconPosition === 'right',
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
