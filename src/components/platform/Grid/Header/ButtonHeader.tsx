'use client'
import { PlusIcon } from '@heroicons/react/20/solid'
import React from 'react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { testIDFormatter } from '~/utils/formatter'

import { GridContext } from '../Provider'

interface CreateButtonProps {
  className?: string
  title?: string
}

export default function CreateButton({
  className,
  title = '',
}: CreateButtonProps) {
  const { state, actions } = React.useContext(GridContext)

  if (state?.config?.hideCreateButton) return null

  const entity = state?.config.entity
  return (
    <Button
      className={cn('flex ', className)}
      data-test-id={testIDFormatter(`${entity}-wzrd-grd-create-btn`)}
      loading={state?.createLoading}
      size='md'
      onClick={() => actions?.handleCreate()}
    >
      {!state?.createLoading && <PlusIcon className="lg:h-5 lg:w-5 w-7 h-7" />}
      {title ? <span className="mr-1">{title}</span> : null}
    </Button>
  )
}
