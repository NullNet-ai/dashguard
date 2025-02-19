'use client'

import {
  ArrowPathIcon as Loader2,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import * as React from 'react'

import { Button, type ButtonProps } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'

interface DropdownOption {
  label: string
  onClick: (arg?: any) => void
  loading?: boolean
  disabled?: boolean
}

interface ButtonWithDropdownProps {
  buttonLabel?: string
  buttonIcon?: React.ElementType
  dropdownOptions: DropdownOption[]
  loading?: boolean
  buttonClassName?: string
  buttonVariant?: ButtonProps['variant']
  entity?: string
  leftIcon?: React.ElementType
  side?: 'start' | 'end'
  options?: any
  disabled?: boolean
}

export function ButtonWithDropdown({
  buttonLabel,
  buttonIcon: ButtonIcon,
  dropdownOptions,
  loading = false,
  buttonClassName,
  buttonVariant = 'outline',
  disabled = false,
  entity,
  leftIcon: Lefticon,
  side = 'end',
  options,
}: ButtonWithDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-test-id={testIDFormatter(`${entity}-wzrd-drd-trigger-btn`)}
          variant={buttonVariant}
          className={cn('flex items-center', buttonClassName)}
          disabled={disabled}
          size='sm'
        >
          {Lefticon && <Lefticon className="mr-2 h-4 w-4" />}
          {/* Render left icon if provided */}
          {buttonLabel || ''}
          {ButtonIcon && <ButtonIcon className="mr-2 h-5 w-5" />}
          {' '}
          {/* Render icon if provided */}
          {loading && <Loader2 className={cn('h-4 w-4 animate-spin')} />}
          {/* Display loading spinner if in loading state */}
          <ChevronDownIcon
            className={`${buttonLabel ? 'ml-2' : ''} h-3 w-4 text-primary-freground`}
            aria-hidden="true"
            strokeWidth={3}
          />
          {/* Arrow icon for dropdown */}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content with responsive handling */}
      <DropdownMenuContent
        align={side}
        className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none"
        sideOffset={5}
        side="bottom"
        collisionPadding={10}
      >
        {dropdownOptions.map((option, index) => (
          <DropdownMenuItem
            data-test-id={testIDFormatter(`${entity}-wzrd-drd-opt-${option?.label?.replace(/\s/g, '')}`)}
            key={index}
            onClick={() => {
              if (disabled) return
              option.onClick(options)
            }}
            className={`block w-full px-4 py-2 text-left text-sm ${
              disabled
                ? 'cursor-not-allowed text-gray-500'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            disabled={disabled}
          >
            {option.loading ? 'Loading...' : option.label}
            {/* Display loading text for the option */}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
