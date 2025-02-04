import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import PlatformWizard from '~/components/platform/Wizard'
import { api } from '~/trpc/server'

import stepLabels from '../_config/stepLabels'
import totalSteps from '../_config/totalSteps'
import WizardSummaryComponent from '../_config/wizardSummaryConfig'
import { type IWizardLayoutProps } from '../types'

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/')
  const wizard_summary = WizardSummaryComponent()

  const record_details = await api.record.getByCode({
    main_entity: mainEntity!,
    id: identifier!,
    pluck_fields: ['id', 'code', 'status'],
  })

  if (!record_details?.data) {
    return notFound()
  }

  const { status } = record_details?.data || {}

  if (status.toLowerCase() === 'active') {
    return notFound()
  }

  // const stepDetails = await api.wizard.getTraverseStepped(`${mainEntity}:wizard:${code}`)
  // /* This is needed to be check to fix error upon redirect
  // from form filter newly created record as draft since it still
  // doesn't have stepDetails saved on redis */
  // if (stepDetails?.traverse) {
  //   const { traverse } = stepDetails || {}

  //   const stepCount = Object.keys(traverse).length;

  //   if (Number(currentStep) > stepCount + 1) {
  //     return notFound()
  //   }
  // }

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
        }}
        summary={wizard_summary}
      >
        {children}
      </PlatformWizard>
    </div>
  )
}

export default WizardLayout
