import { headers } from 'next/headers';

import PlatformWizard from '~/components/platform/Wizard';
import { stepValidator } from '~/components/platform/Wizard/Utils/stepValidation';

import stepLabels from '../_config/stepLabels';
import totalSteps from '../_config/totalSteps';
import WizardSummaryComponent from '../_config/wizardSummaryConfig';
import { type IWizardLayoutProps } from '../types';
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
  await stepValidator({
    currentStep: currentStep!,
    identifier: identifier!,
    mainEntity: mainEntity!,
  });

  return (
    <div>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels,
          traverseSteps: traverseData?.traverse,
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export const dynamic = 'force-dynamic'

export default WizardLayout;
