import pluralize from 'pluralize';
import { ISearchableField } from '../types';
import { formatPhoneNumber } from '~/utils';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

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

const parseJsonOrReturnString = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
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

export const searchSuggestionTransformerTimeline = (
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
                {
                  return    sf.field === field || sf.accessorKey === field
                }
              );
              const value = field !== 'new_value' ?  valueResolver(val) : val;
              const _displayValue =  Array.isArray(value) ? value.join(', ') : value
              result.push({
                ...(searchableField ?? {}),
                entity,
                field,
                values: Array.isArray(value) ? value : [value],
                count,
                type: 'criteria',
                is_custom_value: field === 'new_value',
                display_value: _displayValue,
                raw_value: parseJsonOrReturnString(val) 
              });
            });
          }
        }
      });
    });
  });

  return result;
};



/**
 * Filters an object to return only key-value pairs where the value (not the key) contains the search string
 * @param data - The object to search through
 * @param searchValue - The string to search for within values only
 * @returns Object containing only the key-value pairs where values contain the search string
 */
export const getValuesContainingSearch = <T extends Record<string, any>>(
  data: T,
  searchValue: string
): Partial<T> => { 
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Convert value to string and check if it contains the search value (case-insensitive)
    // Only check the VALUE, not the KEY
    const valueAsString = String(value).toLowerCase();
    const keyAsString = String(key).toLowerCase();
    const searchValueLower = searchValue.toLowerCase();
    
    // Only include if search value is found in the value AND not in the key
    // This ensures we're matching the value content, not the key name
    if (valueAsString.includes(searchValueLower) && !keyAsString.includes(searchValueLower)) {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

export function formatPhoneNumberClient({
  raw_phone_number,
  iso_code,
}: {
  raw_phone_number: string;
  iso_code: string;
}) {
  if (!raw_phone_number || !iso_code) {
    return null;
  }
  // Parse the phone number using the ISO country code
  const phoneNumber = parsePhoneNumberFromString(
    raw_phone_number.includes('+') ? raw_phone_number : `+${raw_phone_number}`,
  );
  if (!phoneNumber) {
    return "Invalid phone number";
  }
  // Check if the number is valid
  if (!phoneNumber.isValid()) {
    return "Invalid phone number";
  }
  // Format the phone number in national format with country code
  const formatted_number = `+${phoneNumber.countryCallingCode} ${phoneNumber.formatNational()}`;
  return formatted_number;
}
