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
  const ormEntity = headerList.get('x-main-entity') || '';
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/');
  const wizard_summary = roleWizardSummary();
  const traverseData = await api.wizard.getTraverseStepped(
    `${mainEntity}:wizard:${identifier}`,
  );
  await stepValidator({
    currentStep: currentStep!,
    identifier: identifier!,
    mainEntity: mainEntity!,
    ormEntity,
  });

  return (
    <div>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 2,
          enableAutoCreate: true,
          entityName: mainEntity,
          stepLabels: {
            1: 'Basic Details',
            2: 'Confirmation',
          },
          traverseSteps: traverseData?.traverse,
          ormEntity,
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  );
};

export const dynamic = 'force-dynamic';

export default WizardLayout;
