import { headers } from "next/headers";
import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";
//** Wizard Configuration */
import WizardSummaryComponent from "../_config/wizardSummaryConfig";
import stepsNavigation from "../_config/stepsNavigation";
import totalSteps from "../_config/totalSteps";
import stepLabels from "../_config/stepLabels";

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props;
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");
  const wizard_summary = WizardSummaryComponent();

  // Uncomment this when you want to validate the steps
  // await stepValidator({
  //   currentStep: currentStep!,
  //   identifier: identifier!,
  //   mainEntity: mainEntity!,
  // })

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          enableAutoCreate: true,
          entityName: mainEntity,
          totalSteps: totalSteps,
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
