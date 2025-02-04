import { notFound } from 'next/navigation'

import { api } from '~/trpc/server'

export const stepValidator = async ({
  identifier,
  currentStep,
  mainEntity,
}: {
  identifier: string
  currentStep: string
  mainEntity: string
}) => {
  if (!identifier || !currentStep || !mainEntity) {
    return notFound()
  }

  if (identifier === 'new' && (Number(currentStep) !== 1)) {
    return notFound()
  }

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

    const stepDetails = await api.wizard.getCurrentStep({
      entity: mainEntity!,
      identifier: code,
    })
    if (currentStep > stepDetails?.step) {
      return notFound()
    }
  }
}
