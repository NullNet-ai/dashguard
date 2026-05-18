import { headers } from 'next/headers'
import React from 'react'

import PlatformWizard from '~/components/platform/Wizard'
import { stepValidator } from '~/components/platform/Wizard/Utils/stepValidation'

import roleWizardSummary from '../(summary)/wizard-summary-config'
import { type IWizardLayoutProps } from '../types'

const WizardLayout = async ({ children }: IWizardLayoutProps) => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/')
  const wizard_summary = roleWizardSummary()

  await stepValidator({
    currentStep: currentStep!,
    identifier: identifier!,
    mainEntity: mainEntity!,
  })

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 3,
          enableAutoCreate: true,
          entityName: mainEntity,
          stepLabels: {
            1: 'Basic Details',
            2: 'Category Details',
            3: 'Confirmation',
          },
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  )
}

export default WizardLayout
