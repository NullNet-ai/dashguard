import { ulid } from 'ulid';
import pluralize from 'pluralize';

export const formatGroupByResult = ({
  data,
  entity,
  field,
}: {
  data: any[];
  entity: string;
  field: string;
})  => {
  return data.map((item) => {
    const { [pluralize(entity)]: entity_data } = item;
    return {
      id: ulid(),
      is_group_by: true,
      value: entity_data?.[field],
      field,
      entity,
      ...item,
    };
  });
};
