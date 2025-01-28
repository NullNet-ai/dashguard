import { EllipsisVertical, SaveIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "~/components/ui/button";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { LockClosedIcon } from "@heroicons/react/24/outline";

interface IEllipsisOptions {
  id: number;
  name: string;
  onClick?: () => void;
}

interface IProps {
  label?: string;
  ellipseOptions: IEllipsisOptions[];
  isDisable?: boolean;
  isLock: boolean;
  form?: any;
  handleSave?: () => void;
  handleCancel?: () => void;
  handleUnlock: () => void;
}

export default function BasicFormHostHeader({
  isLock,
  label,
  ellipseOptions = [],
  isDisable,
  form,
  handleSave,
  handleCancel,
  handleUnlock
}: IProps) {


  return (
    <div className={"flex flex-row items-center justify-between p-2"}>
      <span className="text-sm font-semibold leading-none tracking-tight">
        {label}
      </span>
      {isLock ? (
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={handleUnlock}
          className="m-auto h-6 w-6 rounded-full"
        >
          <LockClosedIcon className="h-4 w-4 cursor-pointer rounded-full border" />
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            variant={"default"}
            onClick={handleSave}
            type="button"
            // loading={}
            size={"xs"}
            className="items-center gap-1 text-sm"
            // {...props}
          >
            <SaveIcon className="h-4 w-4" />
            Save
          </Button>
          <Button
            variant={"outline"}
            onClick={handleCancel}
            type="button"
            size={"xs"}
          >
            {" "}
            <XMarkIcon className="h-4 w-4" />
            Cancel
          </Button>
          <DropdownMenu>
            {!isDisable ? (
              <DropdownMenuTrigger>
                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
            ) : (
              <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
            )}

            <DropdownMenuContent align="start">
              {ellipseOptions?.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={option.onClick}
                  className="flex gap-2"
                >
                  {option.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
