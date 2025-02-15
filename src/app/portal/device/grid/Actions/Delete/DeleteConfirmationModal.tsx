import { ArchiveX } from 'lucide-react'
import {  useRouter } from 'next/navigation'
import React from 'react'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog'
import { Separator } from '~/components/ui/separator'
import { api } from '~/trpc/react'

const DEFAULT_ARCHIVE_TITLE = 'Delete Record'
const DEFAULT_ARCHIVE_PROMPT_MESSAGE = `Are you sure you want to delete this record? This action will permanently remove the record and all related records from the system.`

const DeleteConfirmationModal = ({
  open,
  setOpen,
  record,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  record: any
}) => {
  const router = useRouter()
  const delete_device = api.device.deleteDevice.useMutation()

  const handleDelete = async () => {
    try {
      await delete_device.mutateAsync({ id: record.id })
      setOpen(false)
      router.push(`/portal/device/grid`)
    }
    catch (error) {
      console.error(error)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          <ArchiveX
            className={`rounded-full border border-red-300
               bg-red-100 p-2 text-destructive`}
            size={35}
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">
          {DEFAULT_ARCHIVE_TITLE}
        </div>
        <div className="flex flex-1 gap-2">
          {DEFAULT_ARCHIVE_PROMPT_MESSAGE}
        </div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            className="r-2"
            color="rimary"
            variant="ghost"
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            className="r-2"
            variant="destructive"
            onClick={() => {
              handleDelete()
              setOpen(false)
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmationModal
