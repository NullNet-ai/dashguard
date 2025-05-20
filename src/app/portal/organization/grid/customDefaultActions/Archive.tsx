'use client'

import { ArchiveIcon } from 'lucide-react'

import { type DefaultRowActions } from '~/components/platform/Grid/types'
import { Button } from '~/components/ui/button'

export default function ArchiveComponent({
  setOpen,
  setRecord,
  record,
  row,
}: DefaultRowActions) {
  const contact_organization_id
    = row.original?.organization_contact?.contact_organization_id
  const isContactOrganizationMatch = contact_organization_id === row.id
  const shouldDisplayArchiveWarningPrompt = isContactOrganizationMatch

  if (!row.id || !isContactOrganizationMatch || row?.original?.disabled) return null

  const handleOpenButton = () => {
    setOpen && setOpen(true)
    setRecord
    && setRecord({
      ...record,
      original: {
        ...row.original,
        shouldDisplayArchiveWarningPrompt,
      },
    })
  }
  return (
    <Button
      className='hover:bg-transparent'
      variant='ghost'
      onClick={() => {
        handleOpenButton()
      }}
    >
      <ArchiveIcon
        className={`h-3 w-3 ${row.original.disabled ? 'bg-gray:300 opacity-50' : 'text-destructive'}`}
      />
    </Button>
  )
}
