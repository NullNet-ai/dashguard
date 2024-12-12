"use client";

import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { MinusCircleIcon } from "@heroicons/react/24/outline";
import { Fragment, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { TDisplayType } from "../../../types";

export default function SelectedView({
  records,
  handleRemovedSelectedRecords,
  handleUpdateDisplayType,
  renderComponentSelected,
}: {
  renderComponentSelected?: (record: any) => JSX.Element;
  handleRemovedSelectedRecords: (records: any[]) => void;
  handleUpdateDisplayType: (type: SetStateAction<TDisplayType>) => void;
  records: any;
}) {
  return (
    <Fragment>
      {records.map((record: any, index: number) => (
        <Fragment key={record.id}>
          <Card className="border-none shadow-none">
            <CardHeader
              className={"flex flex-row items-center justify-between"}
            >
              <CardTitle className="text-sm">CO{record.id}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                <DropdownMenuItem
                    onClick={() => {
                      handleUpdateDisplayType('form');
                    }}
                    className="flex gap-2"
                  >
                    <MinusCircleIcon className="h-4 w-4 text-rose-500" />
                    <span>Update selected record</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleRemovedSelectedRecords([record]);
                    }}
                    className="flex gap-2"
                  >
                    <MinusCircleIcon className="h-4 w-4 text-rose-500" />
                    <span>Remove selected record</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {renderComponentSelected ? (
                renderComponentSelected(record)
              ) : (
                <pre>{JSON.stringify(record, null, 2)}</pre>
              )}
            </CardContent>
          </Card>
          {index !== records.length - 1 && <Separator />}
        </Fragment>
      ))}
    </Fragment>
  );
}
