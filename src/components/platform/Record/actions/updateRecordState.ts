'use server';

import { api } from '~/trpc/server';

export async function updateRecordState({
  identifier,
  entity,
  status,
}: {
  identifier: string;
  entity: string;
  status: string;
}) {
  await api.record.updateRecordState({ entity, identifier, status });
}
