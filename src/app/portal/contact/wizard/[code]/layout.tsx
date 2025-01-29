import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import type { IWizardLayoutProps } from "../types";
import totalSteps from "../_config/totalSteps";
import stepLabels from "../_config/stepLabels";
import stepsNavigation from "../_config/stepsNavigation";
import WizardSummaryComponent from "../_config/wizardSummaryConfig";

const WizardLayout = ({ children }: IWizardLayoutProps) => {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const category = headerList.get("x-categories") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");
  let _totalSteps = totalSteps;
  switch (category) {
    case "Employee":
      _totalSteps = 5;
      break;
    default:
      break;
  }
  const wizard_summary = WizardSummaryComponent();
  return (
    <div className="">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: _totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels: stepLabels,
        }}
        summary={wizard_summary}
        stepsNavigation={stepsNavigation}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
