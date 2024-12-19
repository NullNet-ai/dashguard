import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";
import roleWizardSummary from "../(summary)/wizard-summary-config";

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props;

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier, currentStep] = pathname.split("/");
  const _params = {
    identifier: identifier!,
    mainEntity: main_entity!,
  };
  const wizard_summary = roleWizardSummary(_params);

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 2,
          enableAutoCreate: true,
          entityName: main_entity,
          stepLabels: {
            1: "Basic Details",
            2: "Confirmation",
          },
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
