'use server'

import { api } from '~/trpc/server'

export const gotoWizardRecord = async (code: string, entity: string, ref_id: string, query_params: any, record_code?: string) => {

  let _code = code;

  if(code ==='new') {
    const {data, totalCount} = await api.timeline.getDataByReferenceId({
      advance_filter: query_params?.advance_filters,
      reference_id: ref_id,
      pluck: query_params?.pluck
    })

    if(totalCount && totalCount > 0) {
      _code = data?.[0]?.record_code ?? code;
    }
  }

  const result = await api.record.getByCode({
    main_entity: entity,
    id: _code ?? record_code,
    pluck_fields: [
      'id',
      'code',
      'status',
    ],
  })
  return result?.data
}
