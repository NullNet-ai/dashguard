import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PlatformWizard from '~/components/platform/Wizard'
import { api } from '~/trpc/server'

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

  if (identifier !== 'new') {
    const record_details = await api.record.getByCode({
      main_entity: mainEntity!,
      id: identifier!,
      pluck_fields: ['id', 'code', 'status'],
    })

    if (!record_details?.data) {
      return notFound()
    }
    const { status, code } = record_details?.data || {}

    if (status.toLowerCase() === 'active') {
      return notFound()
    }

    const stepDetails = await api.wizard.getTraverseStepped(`${mainEntity}:wizard:${code}`)
    if (stepDetails?.traverse) {
      const { traverse } = stepDetails || {}

      if (Number(currentStep) > Object.keys(traverse).length) {
        return notFound()
      }
    }
  }

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
