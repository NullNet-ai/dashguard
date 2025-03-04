import { headers } from 'next/headers'

import PlatformWizard from '~/components/platform/Wizard'
import { stepValidator } from '~/components/platform/Wizard/Utils/stepValidation'
import { api } from '~/trpc/server'

import stepsNavigation from '../_config/stepsNavigation'
import totalSteps from '../_config/totalSteps'
import WizardSummaryComponent from '../_config/wizardSummaryConfig'
import { type IWizardLayoutProps } from '../types'

import wizardCallbacks from './_actions/wizardCallbacks'

//* * Wizard Configuration */

const WizardLayout = async (props: IWizardLayoutProps) => {
  const { children } = props
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  let category = headerList.get('x-categories') || ''
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/')

  if (identifier !== 'new' && !category) {
    const accountRecord = await api.record.getByCode({
      main_entity: mainEntity!,
      id: identifier!,
      pluck_fields: ['id', 'code', 'categories'],
    })
    if (accountRecord?.data?.categories?.[0]) {
      category = accountRecord?.data?.categories?.[0]
    }
  }

  await stepValidator({
    currentStep: currentStep!,
    identifier: identifier!,
    mainEntity: mainEntity!,
  })

  let resolvedTotalSteps = totalSteps

  switch (category) {
    case 'External User':
      resolvedTotalSteps = 3
      break
    case 'Internal User':
      resolvedTotalSteps = 4
      break
    default:
      resolvedTotalSteps = 2
      break
  }

  const stepLabels = {
    1: 'Category Details',
    2:
      category === 'External User'
        ? 'Invite External User'
        : 'Select Internal User',
    3: category === 'Internal User' ? 'Account Details' : 'Confirmation',
    4: 'Confirmation',
  }

  const wizard_summary = WizardSummaryComponent()
  return (
    <div className='p-1'>
      <PlatformWizard
        config={{
          currentStep: Number(currentStep),
          entityIdentifier: identifier!,
          enableAutoCreate: true,
          entityName: mainEntity,
          totalSteps: resolvedTotalSteps,
          stepLabels,
          title: 'New Account',
          callbackHandlers: wizardCallbacks,
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
