import pluralize from 'pluralize';
import { ISearchableField } from '../types';

const valueResolver = (value: string): string | string[] => {
  if (/^\{.*\}$/.test(value)) {
    const inner = value.slice(1, -1).trim();

    // If it contains quoted strings, extract quoted or unquoted values
    const matches = Array.from(inner.matchAll(/"([^"]+)"|([^,]+)/g)).map(
      (match: any) => (match?.[1] || match?.[2]).trim(),
    );

    return matches;
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
        if (!field.endsWith('_group')) {
          const actualValues = fields[field];
          if (actualValues && typeof actualValues === 'object') {
            Object.entries(actualValues).forEach(([val, count]) => {
              const searchableField = searchableFields?.find(
                (sf) =>
                  sf.field === field &&
                  (pluralize(sf.entity ?? '') === entity ||
                    sf.entity === entity),
              );
              const value = valueResolver(val);
              result.push({
                ...(searchableField ?? {}),
                entity,
                field,
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
