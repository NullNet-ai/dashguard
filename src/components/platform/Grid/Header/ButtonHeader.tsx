"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { PlusIcon } from "@heroicons/react/20/solid";
import { cn } from "~/lib/utils";
import { testIDFormatter } from "~/utils/formatter";

type CreateButtonProps = {
  className?: string;
  title?: string;
};

export default function CreateButton({
  className,
  title = "",
}: CreateButtonProps) {
  const { state, actions } = React.useContext(GridContext);

  if (state?.config?.hideCreateButton) return <></>;

  const entity = state?.config.entity;
  return (
    <Button
      data-test-id={testIDFormatter(`${entity}-wzrd-grd-create-btn`)}
      className={cn("flex ", className)}
      loading={state?.createLoading}
      size='md'
      onClick={() => actions?.handleCreate()}
    >
      {!state?.createLoading && <PlusIcon className="h-5 w-5" />}
      {title ? <span className="mr-1">{title}</span> : null}
    </Button>
  );
}
