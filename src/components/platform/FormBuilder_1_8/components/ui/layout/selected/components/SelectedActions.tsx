import { Copy, EllipsisVertical, Eye, MinusCircleIcon } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import {
  ICustomActions,
  IFeatures,
} from "~/components/platform/FormBuilder/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function SelectedActions({
  form,
  filterGridConfig,
  features,
  customFormFilterLockFormActions = [],
}: {
  form: any;
  filterGridConfig: any;
  features: IFeatures | undefined;
  customFormFilterLockFormActions: ICustomActions[] | undefined;
}) {
  const {
    enableLockFormCopy = true,
    enableLockFormEllipsis = true,
    enableLockFormView = true,
  } = features ?? {};

  if (!enableLockFormEllipsis || (!enableLockFormCopy && !enableLockFormView))
    return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {form?.getValues()?.status === "Active" && enableLockFormView && (
          <DropdownMenuItem
            onClick={() => {
              const currentValues = form.getValues();

              const mainEntity = filterGridConfig?.filter_entity;
              // redirect(`/portal/${mainEntity}/record/${currentValues?.code}`);
            }}
            className="flex gap-2"
          >
            <Eye className="h-4 w-4 text-foreground" />
            <span>View</span>
          </DropdownMenuItem>
        )}
        {enableLockFormCopy && (
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(
                JSON.stringify({
                  ...form.getValues(),
                }),
              );
            }}
            className="flex gap-2"
          >
            <Copy className="h-4 w-4 text-foreground" />
            <span>Copy</span>
          </DropdownMenuItem>
        )}
        {!!customFormFilterLockFormActions?.length &&
          customFormFilterLockFormActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className="flex gap-2"
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
