import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import PlatformWizard from '~/components/platform/Wizard'
import { api } from '~/trpc/server'

import roleWizardSummary from '../(summary)/wizard-summary-config'
import { type IWizardLayoutProps } from '../types'

const WizardLayout = async ({ children }: IWizardLayoutProps) => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , mainEntity, , identifier, currentStep] = pathname.split('/')
  const wizard_summary = roleWizardSummary()

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
    /* This is needed to be check to fix error upon redirect
    from form filter newly created record as draft since it still
    doesn't have stepDetails saved on redis */
    if (stepDetails?.traverse) {
      const { traverse } = stepDetails || {}

      const stepCount = Object.keys(traverse).length;

      if (Number(currentStep) > stepCount + 1) {
        return notFound()
      }
    }
  }

  return (
    <div className='p-1'>
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
