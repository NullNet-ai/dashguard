import {
  ClipboardIcon,
  Copy,
  EllipsisVertical,
  Eraser,
  Eye,
  MinusCircleIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { ICustomActions, IFeatures } from "~/components/platform/EnhancedFormBuilder/types";
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
}: {
  form: any;
  selectedRecords: any;
  features: IFeatures | undefined;
  onSubmitFormGrid: any;
  handleRemovedSelectedRecords: (records: any[]) => void;
  customFormFilterViewFormActions: ICustomActions[] | undefined;
}) {
  const {
    enableViewFormClear = true,
    enableViewFormCopy = true,
    enableViewFormEllipsis = true,
    enableViewFormPaste = true,
  } = features ?? {};
  const actions = [
    // {
    //   icon: <Eye className="h-4 w-4 text-slate-500" />,
    //   label: "View",
    //   handleClick: () => {
    //     console.info("I am viewing the form");
    //     const currentValues = form.getValues();
    //   },
    // },
    {
      icon: <Copy className="h-4 w-4 text-slate-500" />,
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
      icon: <ClipboardIcon className="h-4 w-4 text-slate-500" />,
      label: "Paste",
      onClick: async() => {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipboardText = await navigator.clipboard.readText();
          // clipboardText must be an json to continue else return warn
          try {
            JSON.parse(clipboardText);
          } catch (error) {
            console.warn("Clipboard content is not a valid JSON",error);
            return;
          }
          const parsed_clipboard = JSON.parse(clipboardText);
          form.reset(parsed_clipboard, {
            keepDefaultValues: true,
          });

          if(parsed_clipboard?.id) {
            form.handleSubmit(onSubmitFormGrid)()
          }

        } else {
          console.warn("Clipboard API not supported in this browser.");
        }
      },
    },
    {
      icon: <XIcon className="h-4 w-4 text-slate-500" strokeWidth={3} />,
      label: "Clear",
      onClick: () => {
        console.info("I am clearing the form");
        const currentValues = form.getValues();
        Object.keys(currentValues).forEach((key) => {
          const value = currentValues[key];

          if (Array.isArray(value)) {
            if (key === "email") {
              currentValues[key] = [{ email: "" }];
            } else if (key === "phone") {
              currentValues[key] = [
                {
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
      icon: <Eraser className="h-4 w-4 text-slate-500" />,
      label: "Remove Selection",
      onClick: () => {
        const currentValues = form.formState.defaultValues;
        handleRemovedSelectedRecords([currentValues]);
      },
    },
    ...customFormFilterViewFormActions
  ];

  if (!enableViewFormEllipsis) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => {
          if (action.label === "Copy" && !enableViewFormCopy) return null;
          if (action.label === "Paste" && !enableViewFormPaste) return null;
          if (action.label === "Clear" && !enableViewFormClear) return null;
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick()}
              className="flex gap-2"
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
