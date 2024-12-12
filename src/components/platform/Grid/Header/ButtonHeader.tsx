"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { PlusIcon } from "@heroicons/react/20/solid";
import { cn } from "~/lib/utils";

type CreateButtonProps = { 
  className?: string 
  title?: string
}

export default function CreateButton({ className, title="" }: CreateButtonProps) {
  const { state, actions } = React.useContext(GridContext);
  return (
    <Button
      data-test-id="gridCreateButton"
      className={cn("flex", className)}
      loading={state?.createLoading}
      onClick={() => actions?.handleCreate()}
    >
      {title ?  <span className="mr-1">{title}</span> : null}
     {!state?.createLoading &&  <PlusIcon className="h-5 w-5" />}
    </Button>
  );
}
