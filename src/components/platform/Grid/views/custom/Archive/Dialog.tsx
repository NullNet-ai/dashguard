import { Separator } from "@radix-ui/react-select";
import { TriangleAlertIcon } from "lucide-react";
import { config } from "process";
import React from "react";
import { record } from "zod";
import { DialogContent, DialogFooter, Dialog } from "~/components/ui/dialog";
import { handleArchive } from "../../../DefatultRow/Actions";
import { Button } from "~/components/ui/button";
import FooterButton from "./FooterButton";

interface IFooterButtonConfig {
  color: string;
  title: string;
  onClickButton: () => void;
}

interface IArchiveDialogProps {
  setOpen: (open: boolean) => void;
  buttonConfig: IFooterButtonConfig;
  open: boolean;
  modalHeaderTitle: string;
  modalContent: string;
}

const ArchiveDialog: React.FC<IArchiveDialogProps> = (props) => {
  const { setOpen, open, modalContent, modalHeaderTitle, buttonConfig } = props;
  const { color, title: buttonTitle, onClickButton } = buttonConfig;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          <TriangleAlertIcon
            size={35}
            className={
              "rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
            }
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">{modalHeaderTitle}</div>
        <div className="flex flex-1 gap-2">
          {modalContent}
        </div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <FooterButton
            onClick={onClickButton}
            color={color}
            title={buttonTitle}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDialog;
