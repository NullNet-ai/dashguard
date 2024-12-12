"use client";
import { FileX } from "lucide-react";

import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import removeReportsAsync from "./Action/RemoveReports";

interface IProps {
  filter_id: string;
}

export default function CloseReport({ filter_id }: IProps) {
  const reportReports = async () => {
    removeReportsAsync({ filter_id });
  };

  return (
    <DropdownMenuItem onClick={reportReports} className="flex gap-2">
      <FileX className={`text-default/60 h-4 w-4`} aria-hidden="true" />
      <span>Close Report</span>
    </DropdownMenuItem>
  );
}
