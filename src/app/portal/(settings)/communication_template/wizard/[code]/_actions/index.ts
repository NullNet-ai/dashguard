'use server';

import { api } from '~/trpc/server';

export const updateCommunicationTemplateStatus = async (data: any) => {
  try {
    await api.record.updateRecordStatus({
      entity: 'communication_template',
      id: data.identifier,
      record_status: 'Active',
      field_key: 'communication_template_status',
    });
    return true
  } catch (error) {
    throw error;
  }
};
