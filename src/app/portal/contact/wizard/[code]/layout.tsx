import { headers } from 'next/headers';

import PlatformWizard from '~/components/platform/Wizard';
import { stepValidator } from '~/components/platform/Wizard/Utils/stepValidation';
import { TempPasswordDialogHost } from '~/components/platform/TempPasswordDialog';

import stepLabels from '../_config/stepLabels';
import stepsNavigation from '../_config/stepsNavigation';
import totalSteps from '../_config/totalSteps';
import WizardSummaryComponent from '../_config/wizardSummaryConfig';
import type { IWizardLayoutProps } from '../types';
import wizardCallbacks from './_actions/wizardCallbacks';
import { api } from '~/trpc/server';

const WizardLayout = async ({ children }: IWizardLayoutProps) => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const category = headerList.get('x-categories') || '';
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/');

  const traverseData = await api.wizard.getTraverseStepped(
    `${mainEntity}:wizard:${identifier}`,
  );
  await stepValidator({
    currentStep: currentStep!,
    identifier: identifier!,
    mainEntity: mainEntity!,
  });

  let _totalSteps = totalSteps;
  switch (category) {
    case 'Employee':
      _totalSteps = 5;
      break;
    default:
      break;
  }
  const wizard_summary = WizardSummaryComponent();
  return (
    <div>
      <TempPasswordDialogHost />
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: _totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels,
          callbackHandlers: wizardCallbacks,
          traverseSteps: traverseData?.traverse,
          enableTimeline: true,
          metadata:{
            timeline_title: `Timeline Records (${identifier})`
          }
        }}
        stepsNavigation={stepsNavigation}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export const dynamic = 'force-dynamic'

export default WizardLayout;
