import { Trash2 } from 'lucide-react'
import React from 'react'

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog'
import { Separator } from '~/components/ui/separator'

const DeleteConfirmationDialog = ({
  open,
  onConfirm,
  onChangeContext,
}: {
  open: boolean
  onConfirm: (context: any) => Promise<void>
  onChangeContext: (context: any) => void
}) => {
  const [loading, setLoading] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={onChangeContext}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm flex items-center gap-x-2 ">
          <Trash2
            size={35}
            className='rounded-full border border-red-300 bg-red-100 p-2 text-destructive'
          />
          <div className="flex flex-1 gap-2 py-4 font-bold text-base">
            Delete Image Confirmation
          </div>
        </div>
        
        <div className="flex flex-1 gap-2 text-base min-h-[65px] py-4">
          Are you sure you want to delete the image?
        </div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            onClick={() => {
              onChangeContext(false)
            }}
            className="mr-2"
            variant="ghost"
            color="primary"
          >
            No
          </Button>
          <Button
            variant="destructive"
            className="mr-2"
            loading={loading}
            onClick={async () => {
              setLoading(true)
              await onConfirm('')
              onChangeContext(false)
              setLoading(false)
            }}
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export default DeleteConfirmationDialog
