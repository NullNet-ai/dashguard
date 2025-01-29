"use client";

import { Button } from "~/components/ui/button";
import copyReportsAsync from "./Action/CopyReports";

export default function CopyButton({ filter_id }: { filter_id: string }) {
  const copyReports = () => {
    copyReportsAsync({ filter_id });
  };

  return (
    <Button onClick={copyReports} variant={"secondary"}>
      Copy Reports
    </Button>
  );
}
