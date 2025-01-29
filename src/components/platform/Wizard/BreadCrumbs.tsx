"use client";

import { useContext } from "react";
import { WizardContext } from "./Provider";
import { BreadcrumbSeparator } from "~/components/ui/breadcrumb";
import { camelCase } from "lodash";
import { testIDFormatter } from "~/utils/formatter";

export default function WizardNavigator() {
  const { state } = useContext(WizardContext);
  const { entityName, stepLabels } = state ?? {};
  const modified_entity = entityName === "user_role" ? "role" : entityName;
  const formatEntitiyName = modified_entity
    ?.split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const wizard_step_title = `${formatEntitiyName} `;
  const currentStep = state?.currentStep;

  return (
    <div>
      <nav
        aria-label="breadcrumb"
        data-test-id={camelCase(entityName) + "Breadcrumb"}
      >
        <ol className="flex items-center gap-2 font-semibold">
          <li>
            <span
              className="text-md"
              data-test-id={testIDFormatter(
                `${entityName}-wzrd-breadcrumb-home-link`,
              )}
            >
              {wizard_step_title}
            </span>
          </li>
          <BreadcrumbSeparator className="text-foreground" />
          <li>
            <span
              className="text-md"
              data-test-id={testIDFormatter(
                `${entityName}-wzrd-breadcrumb-${currentStep}-link`,
              )}
            >
              Step {currentStep} -{" "}
              {currentStep !== undefined
                ? (stepLabels?.[currentStep] ?? "")
                : ""} 

            </span>
          </li>
        </ol>
      </nav>
    </div>
  );
}
