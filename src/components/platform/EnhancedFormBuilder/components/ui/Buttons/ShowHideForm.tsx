import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Button } from "~/components/ui/button";

export default function ShowHideForm({
  handleOpen,
  hideAccordions,
  open,
  ...props
}: {
  handleOpen: (e: React.MouseEvent<HTMLButtonElement>) => void;
  open: boolean;
  hideAccordions: boolean;
}) {
  if (hideAccordions) return null;

  return (
    <Fragment>
      {open ? (
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={handleOpen}
          className="m-auto h-6 w-6 rounded-full bg-gray-200"
          {...props}
        >
          <ChevronUpIcon className="h-4 w-4 cursor-pointer" />
        </Button>
      ) : (
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={handleOpen}
          className="m-auto h-6 w-6 rounded-full"
          {...props}
        >
          <ChevronDownIcon className="h-4 w-4 cursor-pointer" />
        </Button>
      )}
    </Fragment>
  );
}
