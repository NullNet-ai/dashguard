import pluralize from 'pluralize';
import { ISearchableField } from '../types';

const valueResolver = (value: string): string | string[] => {
  if (/^\{.*\}$/.test(value)) {
    return value
      .slice(1, -1) // Remove the outer {}
      .split(',') // Split by comma
      .map((v) => v.trim()); // Trim whitespace from each item
  }
  return value;
};

export const searchSuggestionTransformer = (
  data: Record<string, any>[],
  searchableFields: ISearchableField[],
) => {
  const result: any = [];

  data.forEach((item) => {
    Object.entries(item).forEach(([entity, fields]) => {
      Object.entries(fields).forEach(([field, value]) => {
        // Identify *_group fields and check if count > 0
        if (
          field.endsWith('_group') &&
          (value as Record<string, any>).count > 0
        ) {
          const fieldName = field.replace('_group', '');
          const actualValues = fields[fieldName];

          if (actualValues && typeof actualValues === 'object') {
            Object.entries(actualValues).forEach(([val, count]) => {
              const searchableField = searchableFields?.find(
                (sf) =>
                  sf.field === fieldName &&
                  (pluralize(sf.entity ?? '') === entity ||
                    sf.entity === entity),
              );
              const value = valueResolver(val);
              result.push({
                ...(searchableField ?? {}),
                entity,
                field: fieldName,
                values: Array.isArray(value) ? value : [value],
                count,
                type: 'criteria',
                display_value: Array.isArray(value) ? value.join(', ') : value,
              });
            });
          }
        }
      });
    });
  });

  return result;
};
