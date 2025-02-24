'use server'

import { api } from '~/trpc/server'
const handleChangeStatus = async (
  record_status: string,
  recordId: string,
  entityName: string,
  field_key: string,
) => {
  const response = await api.record.updateRecordStatus({
    id: recordId,
    record_status,
    entity: entityName,
    field_key,
  })
  return response
}

export { handleChangeStatus }
