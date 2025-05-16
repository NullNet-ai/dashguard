import { cn } from '~/lib/utils'

export const getStateTabStyles = (
  variant: 'default' | 'pills' | 'underline' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md',
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) => ({
  root: cn('w-full'),
  list: cn(
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    {
      'bg-muted p-1 rounded-lg': variant === 'pills',
      'border-b border-border': variant === 'underline',
    },
    {
      'h-8': size === 'sm',
      'h-10': size === 'md',
      'h-12': size === 'lg',
    }
  ),
  trigger: (isActive: boolean) =>
    cn(
      'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 gap-2',
      'text-sm font-medium transition-all',
      {
        'border-b-2 border-transparent hover:border-primary/30':
          variant === 'default' && !isActive,
        'border-b-2 border-primary': variant === 'default' && isActive,
        'hover:bg-primary/10 rounded-md': variant === 'pills' && !isActive,
        'bg-primary text-primary-foreground rounded-md':
          variant === 'pills' && isActive,
        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full hover:text-primary':
          variant === 'underline' && !isActive,
        'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary text-primary':
          variant === 'underline' && isActive,
      }
    ),
  content: cn('mt-4'),
  icon: cn('inline-flex items-center'),
})
