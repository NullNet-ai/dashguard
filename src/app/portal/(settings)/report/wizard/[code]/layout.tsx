import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props as any;

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  const totalStep = 6;
  
  return (
    <PlatformWizard
      config={{
        currentStep: Number(currentStep),
        entityIdentifier: identifier!,
        totalSteps: totalStep,
        enableAutoCreate: false,
        entityName: mainEntity,
      }}
      // summary={{
      //   one: {
      //     component: <SummaryWizard record_id={identifier!} />,
      //     label: "Basic Details",
      //   },
      // }}
    >
      {children}
    </PlatformWizard>
  );
};

export default WizardLayout;
