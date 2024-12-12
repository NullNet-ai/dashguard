"use client";

import { useContext } from "react";
import { WizardContext } from "./Provider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { camelCase } from "lodash";
import { testIDFormatter } from "~/utils/formatter";


export default function WizardNavigator() {
  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  const wizard_step_title = `${entityName} > Step ${state?.currentStep} - `;
  return (
    <div>
      
    </div>
  );
}
