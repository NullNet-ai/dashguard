import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";
import organizationWizardSummary from "../(summary)/wizard-summary-config";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  const _params = {
    identifier: identifier!,
    mainEntity: mainEntity!,
  };
  const wizard_summary = organizationWizardSummary(_params);

  return (
    <div>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 2,
          enableAutoCreate: true,
          entityName: mainEntity,
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
