import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface IEllipsisOptions {
  id: number;
  name: string;
  onClick?: () => void;
}

interface IProps {
  label?: string;
  ellipseOptions: IEllipsisOptions[];
  isDisable?: boolean;
}

export default function BasicFormHeader({
  label,
  ellipseOptions = [],
  isDisable,
}: IProps) {
  return (
    <div className={"flex flex-row items-center justify-between p-2"}>
      <span className="text-sm font-semibold leading-none tracking-tight">
        {label}
      </span>
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
  );
}
