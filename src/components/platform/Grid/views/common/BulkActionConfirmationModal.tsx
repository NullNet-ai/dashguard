import React, { useContext } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { ArchiveIcon, ArchiveX } from "lucide-react";
import { GridContext } from "../../Provider";
import { formatAndCapitalize } from "~/lib/utils";

interface IConfirmAction {
  archive: (() => void) | undefined;
}

const BulkActionConfirmationModal = ({
  open,
  onOpenChange,
  action_type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action_type: "archive" | null; // Add this line for more bulk actions
}) => {
  const { actions, state } = useContext(GridContext);

  const selectedRows = state?.table?.getSelectedRowModel().rows ?? [];
  const isRecordMultiple = selectedRows?.length > 1;

  if (!action_type) return <></>;

  const title = `${formatAndCapitalize(action_type)} Record${isRecordMultiple ? "s" : ""}`;

  const message = {
    archive: `Are you sure you want to archive ${isRecordMultiple ? "these records" : "this record"}? Archiving will move the record to an inactive state, and it will no longer be available on the active list.`,
  };

  const confirm_actions: IConfirmAction = {
    archive: actions?.handleArchiveBulkRecord,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          {action_type === "archive" && (
            <ArchiveX
              size={35}
              className={
                "rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
              }
            />
          )}
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">{title}</div>
        <div className="flex flex-1 gap-2">{message[action_type]}</div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            onClick={() => {
              onOpenChange(false);
            }}
            className="mr-2"
            variant="ghost"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="mr-2"
            loading={state?.archiveBulkLoading}
            onClick={() => {
              if (confirm_actions[action_type]) {
                confirm_actions[action_type]();
              }
            }}
          >
            {formatAndCapitalize(action_type)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkActionConfirmationModal;
