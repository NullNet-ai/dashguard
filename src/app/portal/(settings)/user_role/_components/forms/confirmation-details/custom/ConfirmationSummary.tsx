"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";

const ConfirmationSummary = () => {
  return (
    <Card className="border-none p-0 shadow-none sm:p-2">
       <CardHeader
           className={"flex flex-row items-center justify-between bg-slate-100"}
         >
        <CardDescription className="text-md text-foreground font-bold">
          Confirmation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {"Confirm that the summary has the correct information."}
        </p>
      </CardContent>
    </Card>
  );
};

export default ConfirmationSummary;
