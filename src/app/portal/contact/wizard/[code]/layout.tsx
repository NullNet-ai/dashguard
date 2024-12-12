import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import type { IWizardLayoutProps } from "../types";
import { steps_navigation } from "./steps-navigation";
import contactWizardSummaryApplicant from "../(summary)/wizard-summary-applicant-config";
import contactWizardSummaryEmployee from "../(summary)/wizard-summary-employee-config";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const category = headerList.get("x-categories") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  let totalSteps = 7;
  switch (category) {
    case "Applicant":
      totalSteps = 10; //10
      break;
    case "Employee":
      totalSteps = 7;
      break;
    default:
      break;
  }
  const _params = {
    identifier: identifier!,
    mainEntity: mainEntity!,
  };
  const wizard_summary =
    category === "Applicant"
      ? contactWizardSummaryApplicant(_params)
      : contactWizardSummaryEmployee(_params);

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
        }}
        summary={wizard_summary}
        stepsNavigation={steps_navigation}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
