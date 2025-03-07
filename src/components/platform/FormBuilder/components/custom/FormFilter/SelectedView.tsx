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
import { capitalize } from 'lodash';

export default function SelectedView({
  records,
  handleRemovedSelectedRecords,
  handleUpdateDisplayType,
  renderComponentSelected,
  entity
}: {
  renderComponentSelected?: (record: any) => JSX.Element;
  handleRemovedSelectedRecords: (records: any[]) => void;
  handleUpdateDisplayType: (type: SetStateAction<TDisplayType>) => void;
  records: any;
  entity?: string
}) {
  return (
    <Fragment>
      {records.map((record: any, index: number) => (
        <Fragment key={record.id}>
          <Card className="border-none shadow-none">
            <CardHeader
              className={"flex flex-row items-center justify-between"}
            >
              <CardTitle className="text-sm"><span>{entity ? `${capitalize(entity ?? '')} ID:` : '' }</span> {record.code}</CardTitle>
              
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
