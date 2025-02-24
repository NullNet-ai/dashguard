import {
  ClipboardIcon,
  Copy,
  EllipsisVertical,
  Eraser,
  Eye,
  MinusCircleIcon,
  XIcon,
} from "lucide-react";
import React, { useContext } from "react";
import {
  type ICustomActions,
  type IFeatures,
} from "~/components/platform/FormBuilder/types";
import { WizardContext } from "~/components/platform/Wizard/Provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function FormFilterOpenedActions({
  form,
  onSubmitFormGrid,
  features,
  handleRemovedSelectedRecords,
  customFormFilterViewFormActions = [],
  selectedRecords,
  filterGridConfig,
}: {
  form: any;
  selectedRecords: any;
  features: IFeatures | undefined;
  onSubmitFormGrid: any;
  handleRemovedSelectedRecords: (records: any[]) => void;
  customFormFilterViewFormActions: ICustomActions[] | undefined;
  filterGridConfig: any;
}) {
  const {
    enableViewFormClear = true,
    enableViewFormCopy = true,
    enableViewFormEllipsis = true,
    enableViewFormPaste = true,
    enableAutoSelect = false,
  } = features ?? {};

  const { onClipboardPaste } = filterGridConfig ?? {};
  const actions = [
    {
      icon: <Copy className="h-4 w-4 text-muted-foreground" />,
      label: "Copy",
      onClick: async () => {
        await navigator.clipboard.writeText(
          JSON.stringify({
            ...form.getValues(),
          }),
        );
      },
    },
    {
      icon: <ClipboardIcon className="h-4 w-4 text-muted-foreground" />,
      label: "Paste",
      onClick: async () => {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipboardText = await navigator.clipboard.readText();
          // clipboardText must be an json to continue else return warn
          try {
            JSON.parse(clipboardText);

            const parsed_clipboard = JSON.parse(clipboardText);
            if (onClipboardPaste) {
              return await onClipboardPaste(
                parsed_clipboard as Record<string, any>,
                form,
                onSubmitFormGrid,
              );
            } else if (enableAutoSelect && parsed_clipboard?.id) {
              // if enableAutoSelect is true, then we will prefill the form
              //  with the clipboard data and submit the form

              form.reset(parsed_clipboard, {
                keepDefaultValues: true,
              });

              form.handleSubmit((data: any) =>
                onSubmitFormGrid(data, { action_type: "Paste" }),
              )();
            } else {
              // defaults to removing id, code, status from the clipboard data
              //  and prefilling the form with the rest of the data
              ["id", "code", "status"].forEach((key: any) => {
                if (parsed_clipboard && typeof parsed_clipboard === "object") {
                  delete parsed_clipboard[key];
                }
              });

              form.reset(parsed_clipboard, {
                keepDefaultValues: true,
              });
            }
          } catch (error) {
            console.warn("Clipboard content is not a valid JSON", error);
            return;
          }
        } else {
          console.warn("Clipboard API not supported in this browser.");
        }
      },
    },
    {
      icon: <XIcon className="h-4 w-4 text-muted-foreground" strokeWidth={3} />,
      label: "Clear",
      onClick: () => {
        const currentValues = form.getValues();
        Object.keys(currentValues).forEach((key) => {
          const value = currentValues[key];
          if (Array.isArray(value)) {
            if (["email", "emails"].includes(key.toLowerCase())) {
              currentValues[key] = [
                {
                  ...value,
                  email: "",
                }
              ];
            } else if (["phone_numbers", "phones", "phone"].includes(key.toLowerCase())) {
              currentValues[key] = [
                {
                  ...value,
                  raw_phone_number: "",
                  iso_code: "us",
                  country_code: "+1",
                  is_primary: true,
                },
              ];
            } else {
              currentValues[key] = [];
            }
          } else if (typeof value === "string") {
            currentValues[key] = "";
          } else if (typeof value === "object" && value !== null) {
            currentValues[key] = {};
          } else {
            currentValues[key] = null;
          }
        });
        form.reset(currentValues, {
          keepDefaultValues: true,
        });
      },
    },
    {
      icon: <Eraser className="h-4 w-4 text-muted-foreground" />,
      label: "Remove Selection",
      onClick: () => {
        const currentValues = form.formState.defaultValues;
        handleRemovedSelectedRecords([currentValues]);
      },
      hidden: !selectedRecords?.length,
    },
    ...customFormFilterViewFormActions,
  ];

  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  if (!enableViewFormEllipsis) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical
          className="h-4 w-4 text-muted-foreground"
          data-test-id={entityName + "-wzrd-form-filter-ddn-trg"}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => {
          if (action.label === "Copy" && !enableViewFormCopy) return null;
          if (action.label === "Paste" && !enableViewFormPaste) return null;
          if (action.label === "Clear" && !enableViewFormClear) return null;
          if (action.hidden) return null;
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick()}
              className="flex gap-2"
              data-tes-id={
                entityName + "-wzrd-form-filter-ddn-itm-" + action.label
              }
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
