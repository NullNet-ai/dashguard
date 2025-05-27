import { ArchiveX } from 'lucide-react';
import React, { useContext } from 'react';

import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { formatAndCapitalize } from '~/lib/utils';

import { GridContext } from '../../Provider';

interface IConfirmAction {
  archive: (() => void) | undefined;
  custom: (() => void) | undefined;
}

const BulkActionConfirmationModal = ({
  open,
  onOpenChange,
  action_type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Add this line for more bulk actions
  action_type: 'archive' | 'custom' | null;
}) => {
  const { actions, state } = useContext(GridContext);
  const { config } = state ?? {};
  const { customBulkDialogConfig } = config ?? {};

  const selectedRows = state?.table?.getSelectedRowModel().rows ?? [];
  const isRecordMultiple = selectedRows?.length > 1;

  if (!action_type) return null;

  const title = `${formatAndCapitalize(action_type)} Record${isRecordMultiple ? 's' : ''}`;

  const message = {
    archive: `Are you sure you want to archive ${isRecordMultiple ? 'these records' : 'this record'}? Archiving will move the record to an inactive state, and it will no longer be available on the active list.`,
    custom: customBulkDialogConfig?.message ?? 'Please provide a message',
  };

  const confirm_actions: IConfirmAction = {
    archive: actions?.handleArchiveBulkRecord,
    custom: actions?.handleCustomBulkAction,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          {action_type === 'archive' && (
            <ArchiveX
              className="rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
              size={35}
            />
          )}
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">
          {action_type !== 'custom' ? title : customBulkDialogConfig?.title}
        </div>
        <div className="flex flex-1 gap-2">{message[action_type]}</div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            className="mr-2"
            color="primary"
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="mr-2"
            loading={state?.actionBulkLoading}
            variant="destructive"
            onClick={() => {
              if (confirm_actions[action_type]) {
                confirm_actions?.[action_type]?.();
              }
            }}
          >
            {customBulkDialogConfig?.button_title
              ? customBulkDialogConfig?.button_title
              : formatAndCapitalize(action_type)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkActionConfirmationModal;
