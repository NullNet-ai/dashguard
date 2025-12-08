import { headers } from 'next/headers';
import PlatformWizard from '~/components/platform/Wizard';
import { type IWizardLayoutProps } from '../types';
//** Wizard Configuration */
import WizardSummaryComponent from '../_config/wizardSummaryConfig';
import stepsNavigation from '../_config/stepsNavigation';
import totalSteps from '../_config/totalSteps';
import stepLabels from '../_config/stepLabels';
import { api } from '~/trpc/server';

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props;
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/');
  const wizard_summary = WizardSummaryComponent();
  const traverseData = await api.wizard.getTraverseStepped(
    `${mainEntity}:wizard:${identifier}`,
  );
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
          traverseSteps: traverseData?.traverse,
        }}
        summary={wizard_summary}
        stepsNavigation={stepsNavigation}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export const dynamic = 'force-dynamic'

export default WizardLayout;
