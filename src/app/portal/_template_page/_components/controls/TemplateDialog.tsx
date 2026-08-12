// TODO: This is a template for dialog components
// Replace 'Template' with your actual entity name and customize the dialog content

"use client";

import React from "react";
import { DefaultRowActions } from "~/components/platform/Grid/types";
import { TriangleAlertIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";

const TemplateDialog = ({ row, config, open, setOpen }: DefaultRowActions) => {
  const handleCloseButton = () => {
    setOpen && setOpen(false);
  };

  // TODO: Add your custom logic here
  // if (!row?.original?.shouldDisplayWarningPrompt) return null;

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
              "rounded-full border border-yellow-300 bg-yellow-100 p-2 text-yellow-600"
            }
          />
        </div>
        <div className="flex flex-1 gap-2 py-4 font-bold">
          {/* TODO: Customize dialog title */}
          Template Dialog Title
        </div>
        <div className="flex flex-1 gap-2">
          {/* TODO: Customize dialog content */}
          Template dialog content goes here.
        </div>
        <Separator className="my-2" />
        <DialogFooter className="py-2">
          <Button
            onClick={handleCloseButton}
            variant="outline"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;