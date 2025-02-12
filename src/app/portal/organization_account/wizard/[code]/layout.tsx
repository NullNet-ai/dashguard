import { headers } from 'next/headers'

import PlatformWizard from '~/components/platform/Wizard'

import stepLabels from '../_config/stepLabels'
import stepsNavigation from '../_config/stepsNavigation'
import totalSteps from '../_config/totalSteps'
import WizardSummaryComponent from '../_config/wizardSummaryConfig'
import { type IWizardLayoutProps } from '../types'
//* * Wizard Configuration */

const WizardLayout = (props: IWizardLayoutProps) => {
  const { children } = props
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/')
  const wizard_summary = WizardSummaryComponent()
  return (
    <div className='p-1'>
      <PlatformWizard
        config={ {
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          enableAutoCreate: true,
          entityName: mainEntity,
          totalSteps,
          stepLabels,
        } }
        stepsNavigation={ stepsNavigation }
        summary={ wizard_summary }
      >
        {children}
      </PlatformWizard>
    </div>
  )
}

export default WizardLayout
