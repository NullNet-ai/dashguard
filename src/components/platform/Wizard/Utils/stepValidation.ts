import { notFound } from 'next/navigation';

import { api } from '~/trpc/server';
import numberToWords from '~/utils/number-to-words';

export const stepValidator = async ({
  identifier,
  currentStep,
  mainEntity,
  ormEntity,
}: {
  identifier: string;
  currentStep: string;
  mainEntity: string;
  ormEntity?: string;
}) => {
  if (!identifier || !currentStep || !mainEntity) {
    return notFound();
  }

  if (identifier === 'new' && Number(currentStep) !== 1) {
    return notFound();
  }

  if (identifier !== 'new') {
    const record_details = await api.record.getByCode({
      main_entity: ormEntity || mainEntity!,
      id: identifier!,
      pluck_fields: ['id', 'code', 'status'],
    });

    if (!record_details?.data) {
      return notFound();
    }
    const { status, code } = record_details?.data || {};

    if (status.toLowerCase() === 'active') {
      return notFound();
    }

    const stepDetails = await api.wizard.getCurrentStep({
      entity: mainEntity!,
      identifier: code,
    });
    const alreadyTraverse =
      stepDetails?.traverse?.[numberToWords(Number(currentStep))];
    if (!alreadyTraverse) {
      return notFound();
    }
  }
};
