import { ShieldMinus } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";

export interface IDialogContext {
  open?: boolean;
  account_id: string;
  status: string;
  index: number;
}

const DeactivateConfirmationDialog = ({
  context,
  onChangeContext,
  onConfirm,
}: {
  context: IDialogContext;
  onChangeContext: (context: IDialogContext) => void;
  onConfirm: (context: IDialogContext) => Promise<void>;
}) => {
  const [loading, setLoading] = React.useState(false);
  const onOpenChange = (open: boolean) => {
    onChangeContext({ open, account_id: "", status: "", index: 0 });
  };
  return (
    <Dialog open={context?.open ?? false} onOpenChange={onOpenChange}>
      <DialogContent className="w-5/6 bg-white sm:w-3/6">
        <div className="mb-2 text-sm">
          <ShieldMinus
            size={35}
            className={
              "rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
            }
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">
          Deactivate Account
        </div>
        <div className="flex flex-1 gap-2">
          {
            "Are you sure you want to deactivate the account? This will disable the user to access the system."
          }
        </div>
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
            loading={loading}
            onClick={async () => {
              setLoading(true);
              await onConfirm(context);
              onOpenChange(false);
              setLoading(false);
            }}
          >
            Deactive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateConfirmationDialog;
