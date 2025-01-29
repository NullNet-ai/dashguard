import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";
import WizardSummaryComponent from "../_config/wizardSummaryConfig";
import totalSteps from "../_config/totalSteps";
import stepLabels from "../_config/stepLabels";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");
  const wizard_summary = WizardSummaryComponent();
  return (
    <div>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels: stepLabels,
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
