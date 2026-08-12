"use client";

import React from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { CardComponent as Card } from '~/components/ui/card/index';

const ConfirmationSummary = () => {
  return (
    <Card>
      <CardHeader
        className={"flex flex-row items-center justify-between bg-slate-100"}
      >
        <CardDescription className="text-md font-bold text-foreground">
          Confirmation
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-2">
        <p className="text-md">
          {"Confirm that the summary has the correct information."}
        </p>
      </CardContent>
    </Card>
  );
};

export default ConfirmationSummary;
