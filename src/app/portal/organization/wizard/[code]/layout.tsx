import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props;

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";

  const [, , mainEntity, , identifier, currentStep] = pathname.split("/");

  return (
    <div>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 2,
          enableAutoCreate: false,
          entityName: mainEntity,
        }}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
