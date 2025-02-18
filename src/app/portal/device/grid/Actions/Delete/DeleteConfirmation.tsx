'use client'

import { Button } from '@headlessui/react'
import { ArchiveIcon } from 'lucide-react'
import { useState } from 'react'

import { type DefaultRowActions } from '~/components/platform/Grid/types'

import DeleteConfirmationModal from './DeleteConfirmationModal'

const DeleteConfirmation = (props: DefaultRowActions) => {
  const { row } = props || {}
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <DeleteConfirmationModal
        open={open}
        record={row}
        setOpen={setOpen}
      />
    )
  }

  return (
    <Button
      onClick={() => {
        setOpen(true)
      }}
    >
      <ArchiveIcon className="h-3 w-3 text-destructive" />
    </Button>
  )
}

export default DeleteConfirmation
