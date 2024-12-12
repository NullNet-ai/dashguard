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
import { ICustomActions, IFeatures } from "~/components/platform/EnhancedFormBuilder/types";
import { testIDFormatter } from "~/utils/formatter";

const ViewFormActions = ({
  saveForm,
  form,
  formKey,
  formSchema,
  isButtonLoading,
  features,
  formProps,
  customFormHostViewFormActions = []
}: {
  saveForm: any;
  form: any;
  formSchema: any;
  isButtonLoading: boolean;
  formKey: string;
  features : IFeatures | undefined;
  formProps?: any;
  customFormHostViewFormActions: ICustomActions[] | undefined;
}) => {

  const { enableFormHostViewActions = true } = features ?? {};

  if(!enableFormHostViewActions) return null
  return (
    <div className="flex flex-row gap-2">
      <SubmitForm
        saveForm={saveForm}
        data-test-id={testIDFormatter(`${formProps?.entity}-wizard-${formKey}-save-form-btn`)}
        form={form}
        formSchema={formSchema}
        isLoading={isButtonLoading}
      />
      <CancelFormButton
        saveForm={saveForm}
        form={form}
        data-test-id={testIDFormatter(`${formProps?.entity}-wizard-${formKey}-cancel-form-btn`)}
        formSchema={formSchema}
        isLoading={isButtonLoading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          data-test-id={testIDFormatter(`${formProps?.entity}-wizard-${formKey}-more-actions-menu`)}
        >
          <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
           data-test-id={testIDFormatter(`${formProps?.entity}-wizard-${formKey}-more-actions-clear-form`)}
            onClick={() => {
              const currentValues = form.getValues();
              Object.keys(currentValues).forEach((key) => form.setValue(key, ""));
            }}
            className="flex gap-2"
          >
            <XIcon className="h-3 w-3 text-slate-500" strokeWidth={3}/>
            Clear
          </DropdownMenuItem>
        {
          !!customFormHostViewFormActions.length && customFormHostViewFormActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              data-test-id={testIDFormatter(`${formProps?.entity}-wizard-${formKey}-more-actions-${camelCase(action.label)}`)}
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

export default ViewFormActions;
