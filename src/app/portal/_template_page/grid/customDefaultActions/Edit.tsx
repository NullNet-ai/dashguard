// TODO: This is a template for custom default action components
// Replace 'Template' with your actual entity name and customize the action logic

'use client'

import { EditIcon } from 'lucide-react'
import { type DefaultRowActions } from '~/components/platform/Grid/types'
import { Button } from '~/components/ui/button'

export default function EditComponent({
  setOpen,
  setRecord,
  record,
  row,
}: DefaultRowActions) {
  // TODO: Add your custom logic here
  // const shouldShowEdit = row.original?.some_condition
  
  if (!row.id || row?.original?.disabled) return null

  const handleEditButton = () => {
    // TODO: Implement your edit logic here
    setOpen && setOpen(true)
    setRecord && setRecord({
      ...record,
      original: {
        ...row.original,
        // Add any additional properties needed
      },
    })
  }
  
  return (
    <Button
      className='hover:bg-transparent'
      variant='ghost'
      onClick={() => {
        handleEditButton()
      }}
    >
      <EditIcon
        className={`h-3 w-3 ${row.original.disabled ? 'bg-gray:300 opacity-50' : 'text-blue-500'}`}
      />
    </Button>
  )
}