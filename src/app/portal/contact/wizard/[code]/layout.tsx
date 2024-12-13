import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import type { IWizardLayoutProps } from "../types";
import { steps_navigation } from "./steps-navigation";
import contactWizardSummary from "../(summary)/wizard-summary-config";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const category = headerList.get("x-categories") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  let totalSteps = 5;
  switch (category) {
    case "Employee":
      totalSteps = 5;
      break;
    default:
      break;
  }
  const _params = {
    identifier: identifier!,
    mainEntity: mainEntity!,
  };
  const wizard_summary = contactWizardSummary(_params);
  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels:{
            1: "Basic Details",
            2: "Contact Details",
          }
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
