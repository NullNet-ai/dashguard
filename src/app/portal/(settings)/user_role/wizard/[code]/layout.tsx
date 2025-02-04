import { headers } from 'next/headers'
import React from 'react'

import PlatformWizard from '~/components/platform/Wizard'

import roleWizardSummary from '../(summary)/wizard-summary-config'
import { type IWizardLayoutProps } from '../types'

const WizardLayout = async (props: IWizardLayoutProps) => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, , identifier, currentStep] = pathname.split('/')
  const wizard_summary = roleWizardSummary()

  return (
    <div className="p-1">
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: 3,
          enableAutoCreate: true,
          entityName: main_entity,
          stepLabels: {
            1: 'Basic Details',
            2: 'Category Details',
            3: 'Confirmation',
          },
        }}
        summary={wizard_summary}
      >
        {props.children}
      </PlatformWizard>
    </div>
  )
}

export default WizardLayout
