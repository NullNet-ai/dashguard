"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { LogsIcon } from "lucide-react";
import { GridContext } from "../Provider";

export default function CardViewButton() {
  const { state, actions } = React.useContext(GridContext);
  const active = state?.viewMode === "card";
  return (
    <Button
    variant={active ? 'default' : 'outline'}
      loading={state?.createLoading}
      className="rounded-l-none"
      onClick={() => actions?.handleSwitchViewMode("card")}
    >
      <LogsIcon className="h-4 w-4" />
    </Button>
  );
}
