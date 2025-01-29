'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { ChevronDown } from 'lucide-react'
import { cn } from '~/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

const Tabs = TabsPrimitive.Root

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  responsive?: boolean
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(
  (
    {
      className,
      orientation = 'horizontal',
      variant = 'default',
      size = 'md',
      responsive = true,
      ...props
    },
    ref
  ) => {
    const [isDropdown, setIsDropdown] = React.useState(false)
    const listRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (!responsive) return

      const checkOverflow = () => {
        if (listRef.current) {
          const isOverflowing =
            listRef.current.scrollWidth > listRef.current.clientWidth
          setIsDropdown(isOverflowing)
        }
      }

      checkOverflow()
      window.addEventListener('resize', checkOverflow)
      return () => window.removeEventListener('resize', checkOverflow)
    }, [responsive])

    const baseStyles = {
      default: 'border-b border-border',
      pills: 'bg-muted p-1 rounded-lg',
      underline: 'border-b border-border',
    }

    const sizeStyles = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
    }

    return (
      <div className="relative w-full">
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            baseStyles[variant],
            sizeStyles[size],
            !isDropdown && 'scrollbar-hide overflow-x-auto',
            className
          )}
          {...props}
        />
        {isDropdown && responsive && (
          <DropdownMenu>
            <DropdownMenuTrigger className="absolute right-0 top-0">
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {React.Children.map(props.children, (child) => (
                <DropdownMenuItem>{child}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'pills' | 'underline'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default:
      'border-b-2 border-transparent hover:border-primary/30 data-[state=active]:border-primary',
    pills:
      'rounded-md hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
    underline:
      'border-b-2 border-transparent hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary',
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5',
        'text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
