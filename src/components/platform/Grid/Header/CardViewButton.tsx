"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { LogsIcon } from "lucide-react";
import { GridContext } from "../Provider";
import { testIDFormatter } from "~/utils/formatter";

export default function CardViewButton() {
  const { state, actions } = React.useContext(GridContext);
  const active = state?.viewMode === "card";
  return (
    <Button
    variant={active ? 'default' : 'outline'}
      size='md'
      className="rounded-l-none hidden lg:block"
      onClick={() => actions?.handleSwitchViewMode("card")}
      data-test-id={testIDFormatter(`${state?.config.entity}-grd-card-view-btn`)}
    >
      <LogsIcon className="h-4 w-4" />
    </Button>
  );
}
