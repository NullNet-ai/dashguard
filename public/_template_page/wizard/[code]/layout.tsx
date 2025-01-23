import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import WizardSummaryComponent from "../(summary)/wizard-summary-config";
import { type IWizardLayoutProps } from "../types";
import { steps_navigation } from "./steps-navigation";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  const _params = {
    identifier: identifier!,
    mainEntity: mainEntity!,
  };
  const wizard_summary = WizardSummaryComponent(_params);

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 2,
          enableAutoCreate: true,
          entityName: mainEntity,
          stepLabels: {
            1: "Basic Details One",
            2: "Basic Details Two",
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
