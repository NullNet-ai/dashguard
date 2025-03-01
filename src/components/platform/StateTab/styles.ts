import { cn } from "~/lib/utils";

export const getStateTabStyles = (
  variant: "default" | "pills" | "underline" | "shadow" = "default",
  size: "sm" | "md" | "lg" = "md",
  orientation: "horizontal" | "vertical" = "horizontal",
  position: "left" | "right" = "right",
) => ({
  root: cn('w-full'),
  list: cn(
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    {
      'inline-flex items-center': orientation === 'horizontal',
      'h-auto': orientation === 'vertical',
      'bg-muted p-1 rounded-lg': variant === 'pills',
      'border-b border-gray-200': variant !== 'pills' && orientation === 'horizontal',
      'border-r border-gray-200': variant !== 'pills' && orientation === 'vertical' && position === 'right',
      'border-l border-gray-200': variant !== 'pills' && orientation === 'vertical' && position === 'left',
    },
    {
      'h-9': size === 'sm' && orientation === 'horizontal',
      'h-10': size === 'md' && orientation === 'horizontal',
      'h-12': size === 'lg' && orientation === 'horizontal',
    }
  ),
  trigger: (isActive: boolean) =>
    cn(
      'inline-flex items-center whitespace-nowrap',
      orientation === 'vertical' ? 'justify-start w-full' : 'justify-center',
      'text-sm transition-all',
      {
        // Default variant
        'px-4 py-1': variant === 'default',
        'border-b-2': variant === 'default' && orientation === 'horizontal',
        'border-r-2': variant === 'default' && orientation === 'vertical' && position === 'right',
        'border-l-2': variant === 'default' && orientation === 'vertical' && position === 'left',
        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': 
          variant === 'default' && !isActive,
        'border-blue-500 text-blue-600 font-medium': 
          variant === 'default' && isActive,

        // Pills variant
        'px-3 py-1.5 rounded-md': variant === 'pills',
        'text-gray-500 hover:text-gray-700 hover:bg-gray-100': 
          variant === 'pills' && !isActive,
        'bg-[#6366F1] text-white': 
          variant === 'pills' && isActive,

        // Underline variant
        'text-gray-500 hover:text-gray-700': 
          variant === 'underline' && !isActive,
        'text-blue-600 font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500': 
          variant === 'underline' && isActive && orientation === 'horizontal',
        'text-blue-600 font-medium after:absolute after:right-0 after:top-0 after:h-full after:w-0.5 after:bg-blue-500': 
          variant === 'underline' && isActive && orientation === 'vertical' && position === 'right',
        'text-blue-600 font-medium after:absolute after:left-0 after:top-0 after:h-full after:w-0.5 after:bg-blue-500': 
          variant === 'underline' && isActive && orientation === 'vertical' && position === 'left',

        // Shadow variant
        'rounded-md shadow-lg': variant === 'shadow',
        'text-gray-600 hover:bg-gray-50': variant === 'shadow' && !isActive,
        'text-blue-600 shadow-lg': variant === 'shadow' && isActive,

        // Sizes
        'text-sm': size === 'sm',
        'text-base': size === 'md',
        'text-lg': size === 'lg',

        // Disabled state
        'opacity-50 cursor-not-allowed': false, // Add disabled prop if needed
      }
    ),
  content: cn(
    'mt-4',
    orientation === 'vertical' && position === 'right' && 'mt-0 ml-4',
    orientation === 'vertical' && position === 'left' && 'mt-0 mr-4'
  ),
  icon: cn('mr-2 inline-flex items-center'),
})
