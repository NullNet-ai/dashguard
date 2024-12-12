"use client";

import { useContext } from "react";
import { WizardContext } from "./Provider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { camelCase } from "lodash";
import { testIDFormatter } from "~/utils/formatter";


export default function WizardNavigator() {
  const { state } = useContext(WizardContext);
  const { entityName } = state ?? {};
  return (
    <Breadcrumb data-test-id={camelCase(entityName)+'Breadcrumb'}>
      <BreadcrumbList >
        <BreadcrumbItem>
          <BreadcrumbLink 
            data-test-id={testIDFormatter(`${entityName}-wizard-breadcrumb-home-link`)}
          href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
        <BreadcrumbPage>
          {entityName
            ?.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
