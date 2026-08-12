import pluralize from 'pluralize';
import { ulid } from 'ulid';

import { formatPhoneNumber } from '~/utils/formatter';

export const formatGroupByResult = ({
  data,
  entity,
  field,
  accessorKey,
}: {
  data: any[];
  entity: string;
  field: string;
  accessorKey: string;
}) => {
  return data.map((item) => {
    const { [pluralize(entity)]: entity_data } = item;
    // ORM group_by returns the grouped value under a flat "<entity>_<field>" key
    // (e.g. device_services_protocol), not nested — fall back to that.
    const flatKey = `${entity}_${field}`;
    const sourceData =
      entity_data ??
      item[entity] ??
      (flatKey in item ? { [field]: item[flatKey] } : undefined);
    const formatted_value =
      formatValue(sourceData, accessorKey) || formatValue(sourceData, field);
    return {
      id: sourceData?.[field] || 'null',
      is_group_by: true,
      value: sourceData?.[field],
      formatted_value,
      field,
      entity,
      ...item,
    };
  });
};

export const formatValue = (entity_data: any, field: string) => {
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
