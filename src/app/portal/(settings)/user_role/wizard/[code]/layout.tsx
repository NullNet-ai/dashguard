import { headers } from 'next/headers';
import React from 'react';

import PlatformWizard from '~/components/platform/Wizard';
import { stepValidator } from '~/components/platform/Wizard/Utils/stepValidation';

import roleWizardSummary from '../(summary)/wizard-summary-config';
import { type IWizardLayoutProps } from '../types';
import { api } from '~/trpc/server';

const WizardLayout = async ({ children, params }: IWizardLayoutProps) => {
  const { code } = await params;
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/');
  const wizard_summary = roleWizardSummary();
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
          // WP-839: Category Details removed; Confirmation moves from step 3 to
          // step 2. This config is the live one — wizard/_config/* is dead for
          // this wizard (nothing imports it).
          totalSteps: 2,
          enableAutoCreate: true,
          entityName: mainEntity,
          stepLabels: {
            1: 'Basic Details',
            2: 'Confirmation',
          },
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
