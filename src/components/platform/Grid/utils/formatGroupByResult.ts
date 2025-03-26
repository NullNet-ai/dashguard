import pluralize from 'pluralize';
import { ulid } from 'ulid';

import { formatPhoneNumber } from '~/utils/formatter';

export const formatGroupByResult = ({
  data,
  entity,
  field,
}: {
  data: any[];
  entity: string;
  field: string;
}) => {
  return data.map((item) => {
    const { [pluralize(entity)]: entity_data } = item;
    const sourceData = entity_data ? entity_data : item[entity];
    return {
      id: ulid(),
      is_group_by: true,
      value: sourceData?.[field],
      formatted_value: formatValue(sourceData, field),
      field,
      entity,
      ...item,
    };
  });
};

const formatValue = (entity_data: any, field: string) => {
  if (!entity_data) return null;
  switch (field) {
    case 'raw_phone_number': {
      const phoneNumber = formatPhoneNumber({
        raw_phone_number: entity_data?.[field] as string,
        iso_code: entity_data?.iso_code as string,
      });
      return phoneNumber;
    }
    default: {
      return entity_data?.[field];
    }
  }
};
