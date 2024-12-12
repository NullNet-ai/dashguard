import { headers } from "next/headers";

import PlatformWizard from "~/components/platform/Wizard";
import { type IWizardLayoutProps } from "../types";

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props;

  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "";
  const [, , main_entity, , identifier, currentStep] = pathname.split("/");

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 2,
          enableAutoCreate: false,
          entityName: main_entity,
        }}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export default WizardLayout;
