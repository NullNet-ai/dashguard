"use client";

import React, { useState } from "react";
import { DefaultRowActions } from "~/components/platform/Grid/types";
import FooterButton from "./FooterButton";
import { TriangleAlertIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";

const ArchiveDialog = ({ row, config, open, setOpen }: DefaultRowActions) => {
  const handleCloseButton = () => {
    setOpen && setOpen(false);
  };

  if (!row?.original?.shouldDisplayArchiveWarningPrompt) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen && setOpen(open);
      }}
    >
      <DialogContent className="w-5/6 bg-white md:w-3/6">
        <div className="mb-2 text-sm">
          <TriangleAlertIcon
            size={35}
            className={
              "rounded-full border border-red-300 bg-red-100 p-2 text-destructive"
            }
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">
          Cannot Archive Organization
        </div>
        <div className="flex flex-1 gap-2">
          This organization has assigned contacts. Please remove all contact
          assignments before archiving.
        </div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <FooterButton
            onClick={handleCloseButton}
            color="primary"
            title="Close"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDialog;
