import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import {
  EllipsisVertical,
  MinusCircleIcon,
  CircleCheck,
  CircleX,
} from "lucide-react";
import React from "react";
import SubmitForm from "../../../Buttons/Submit";
import CancelFormButton from "../../../Buttons/Cancel";

const ViewFormActions = ({
  saveForm,
  form,
  formSchema,
  isButtonLoading,
}: {
  saveForm: any;
  form: any;
  formSchema: any;
  isButtonLoading: boolean;
}) => {
  return (
    <div className="flex flex-row gap-2">
      <SubmitForm
        saveForm={saveForm}
        form={form}
        formSchema={formSchema}
        isLoading={isButtonLoading}
      />
      <CancelFormButton
        saveForm={saveForm}
        form={form}
        formSchema={formSchema}
        isLoading={isButtonLoading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              const currentValues = form.getValues();
              Object.keys(currentValues).forEach((key) => form.setValue(key, ""));
            }}
            className="flex gap-2"
          >
            <span>Clear</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ViewFormActions;
