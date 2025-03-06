import { cn } from "~/lib/utils";

export const getStateTabStyles = (
  variant: "default" | "pills" | "underline" = "default",
  size: "sm" | "md" | "lg" = "md",
  orientation: "horizontal" | "vertical" = "horizontal",
) => ({
  root: cn('w-full'),
  list: cn(
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    {
      'inline-flex items-center': orientation === 'horizontal',
      'bg-muted p-1 rounded-lg': variant === 'pills',
      'border-b border-gray-200': variant !== 'pills',
    },
    {
      'h-9': size === 'sm',
      'h-10': size === 'md',
      'h-12': size === 'lg',
    }
  ),
  trigger: (isActive: boolean) =>
    cn(
      'inline-flex items-center justify-center whitespace-nowrap',
      'text-sm transition-all',
      {
        // Default variant
        'px-4 py-1 border-b-2': variant === 'default',
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
        'px-4 py-1': variant === 'underline',
        'text-gray-500 hover:text-gray-700': 
          variant === 'underline' && !isActive,
        'text-blue-600 font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500': 
          variant === 'underline' && isActive,

        // Sizes
        'text-sm': size === 'sm',
        'text-base': size === 'md',
        'text-lg': size === 'lg',

        // Disabled state
        'opacity-50 cursor-not-allowed': false, // Add disabled prop if needed
      }
    ),
  content: cn('mt-4'),
  icon: cn('mr-2 inline-flex items-center'),
})
