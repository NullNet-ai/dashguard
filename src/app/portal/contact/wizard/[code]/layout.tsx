import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import type { IWizardLayoutProps } from "../types";
import { steps_navigation } from "./steps-navigation";
import contactWizardSummary from "../(summary)/wizard-summary-config";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  const _params = {
    identifier: identifier!,
    mainEntity: mainEntity!,
  };
  const wizard_summary = contactWizardSummary(_params);
  return (
    <div className="">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 6,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels: {
            1: "Basic Details",
            2: "Contact Details",
            3: "Category Details",
            4: "Organization",
            5: "Account Details",
            6: "Confirmation",
          },
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
