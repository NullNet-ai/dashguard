"use client";

import { Field, Label, Switch } from "@headlessui/react";
import { useContext } from "react";
import { Button } from "~/components/ui/button";
import { GridContext } from "../Provider";
import { type Column } from "@tanstack/react-table";
const getHeaderValue = (column: Column<unknown>): string => {
  const header = column.columnDef.header;

  if (typeof header === "string") {
    return header;
  }

  return column.id;
};
export default function Fields() {
  const { state } = useContext(GridContext);
  return (
    <div className="flex max-w-7xl items-center justify-between sm:px-4 lg:px-6">
      <div className="p-2">
        {state?.table.getAllLeafColumns()?.map((column) => (
          <Field
            key={column.id}
            className="my-2 flex items-center justify-between rounded-md p-2 hover:bg-sky-100"
          >
            <Label as="span" className="text-sm">
              <span className="font-medium text-gray-900">
                {getHeaderValue(column)}
              </span>{" "}
            </Label>
            <Switch
              onClick={column.getToggleVisibilityHandler()}
              id={column.id}
              checked={column.getIsVisible()}
              className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
              />
            </Switch>
          </Field>
        ))}
        <div className="flex items-center space-x-2 pt-2">
          <Button
            variant={"outline"}
            onClick={state?.table.getToggleAllColumnsVisibilityHandler()}
            className="flex-grow bg-primary/5"
          >
            {state?.table?.getIsAllColumnsVisible()
              ? "Hide all fields"
              : "Show all fields"}
          </Button>
          <Button variant={"outline"} className="flex-grow bg-primary/5">
            Show system fields
          </Button>
        </div>
      </div>
    </div>
  );
}
