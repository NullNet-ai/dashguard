import React from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { handleArchive } from "../DefatultRow/Actions";
import { ArchiveX } from "lucide-react";
import ArchiveDialog from "./custom/Archive/Dialog";
import { TArchiveType } from "../types";

const DEFAULT_ARCHIVE_TITLE = "Archive Record";
const DEFAULT_ARCHIVE_PROMPT_MESSAGE = `Are you sure you want to archive this record? Archiving will move the
          record to an inactive state, and it will no longer be available on the
          active list.`;

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

  if (config.archiveDialogCustomComponent) {
    const result = config.archiveDialogCustomComponent({ row: record, config, open, setOpen });
    if (result) {
      return <>{result}</>;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          <ArchiveX
            size={35}
            className={
              "rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
            }
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
              if (config?.archiveCustomAction) {
                config?.archiveCustomAction(record.original);
              } else {
                handleArchive({ row: record, config });
              }
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
