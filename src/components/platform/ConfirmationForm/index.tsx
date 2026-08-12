"use client";

import React, { useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { testIDFormatter } from '~/utils/formatter';
import { WizardContext } from '../Wizard/Provider';

export const ConfirmationSummary = () => {
  const { state } = useContext(WizardContext);
  const { entityName, title } = state ?? {};
  const modified_entity = entityName === 'user_role' ? 'role' : entityName;
  const formatEntityName = title
    ? title
    : modified_entity
        ?.split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');

  return (
    <Card>
      <CardHeader className={"flex flex-row items-center justify-between bg-slate-100"}>
        <CardDescription 
          className="text-md font-bold"
          data-testid={testIDFormatter(`${entityName}-confirmation-title`)}
        >
          {formatEntityName} Confirmation
        </CardDescription>
      </CardHeader>
      <CardContent 
        className="text-sm"
        data-testid={testIDFormatter(`${entityName}-confirmation-content`)}
      >
        Confirm that the {formatEntityName?.toLowerCase()} summary has the correct information.
      </CardContent>
    </Card>
  );
};

export default ConfirmationSummary;
