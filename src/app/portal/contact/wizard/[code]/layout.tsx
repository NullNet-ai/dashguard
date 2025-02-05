import { headers } from 'next/headers'

import PlatformWizard from '~/components/platform/Wizard'
import { stepValidator } from '~/components/platform/Wizard/Utils/stepValidation'

import stepLabels from '../_config/stepLabels'
import stepsNavigation from '../_config/stepsNavigation'
import totalSteps from '../_config/totalSteps'
import WizardSummaryComponent from '../_config/wizardSummaryConfig'
import type { IWizardLayoutProps } from '../types'

const WizardLayout = async ({ children }: IWizardLayoutProps) => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const category = headerList.get('x-categories') || ''
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/')

  await stepValidator({
    currentStep: currentStep!,
    identifier: identifier!,
    mainEntity: mainEntity!,
  })

  let _totalSteps = totalSteps
  switch (category) {
    case 'Employee':
      _totalSteps = 5
      break
    default:
      break
  }
  const wizard_summary = WizardSummaryComponent()
  return (
    <div>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          totalSteps: _totalSteps,
          enableAutoCreate: false,
          entityName: mainEntity,
          stepLabels,
        }}
        stepsNavigation={stepsNavigation}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  )
}

export default WizardLayout
