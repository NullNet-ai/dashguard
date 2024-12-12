import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { handleArchive } from "../DefatultRow/Actions";
import { Trash2 } from "lucide-react";

const ArchiveConfirmationModal = ({
  open,
  setOpen,
  record,
  config,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  record: any;
  config: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[30%] w-[30%] bg-white">
        <div className="mb-2 text-sm">
          <Trash2
            size={35}
            className={
              "rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
            }
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">Archive Record</div>
        <div className="flex flex-1 gap-2">
          Are you sure you want to archive this record? Archiving will move the
          record to an inactive state, and it will no longer be available on the
          active list.
        </div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            onClick={() => {
              setOpen(false);
            }}
            className="mr-2"
            variant="ghost"
            color="primary"

          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleArchive({ row: record, config });
              setOpen(false);
            }}
            variant="destructive"
            className="mr-2"
          >
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveConfirmationModal;
