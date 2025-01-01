import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  MinusCircleIcon,
  CircleCheck,
  CircleX,
  XIcon,
} from "lucide-react";
import React from "react";
import SubmitForm from "../../../Buttons/Submit";
import CancelFormButton from "../../../Buttons/Cancel";
import { camelCase } from "lodash";
import { ICustomActions, IFeatures } from "~/components/platform/FormBuilder/types";
import { testIDFormatter } from "~/utils/formatter";

const LockFormActions = ({
  saveForm,
  form,
  formKey,
  formSchema,
  isButtonLoading,
  features,
  formProps,
  customFormHostLockFormActions = []
}: {
  saveForm: any;
  form: any;
  formSchema: any;
  isButtonLoading: boolean;
  formKey: string;
  features : IFeatures | undefined;
  formProps?: any;
  customFormHostLockFormActions: ICustomActions[] | undefined;
}) => {

  const { enableFormHostLockActions = true } = features ?? {};

  if(!enableFormHostLockActions || !customFormHostLockFormActions.length) return null
  return (
    <div className="flex flex-row gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          data-test-id={testIDFormatter(`${formProps?.entity}-wzrd-${formKey}-more-actions-menu`)}
        >
          <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
        {
          !!customFormHostLockFormActions.length && customFormHostLockFormActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              data-test-id={testIDFormatter(`${formProps?.entity}-wzrd-${formKey}-more-actions-${camelCase(action.label)}`)}
              onClick={action.onClick}
              className="flex gap-2"
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))
        }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LockFormActions;
