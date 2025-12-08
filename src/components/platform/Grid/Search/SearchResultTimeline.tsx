import { ComboboxOption } from '@headlessui/react';
import React, { useContext } from 'react';

import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';

import { SearchGridContext } from './Provider';
import { ISearchableField, type ISearchItemResult } from './types';
import { useGrid } from '../Provider';
import { isEmpty, isObject } from 'lodash';
import {
  formatPhoneNumberClient,
  getValuesContainingSearch,
} from './utils/searchSuggestionTransformer';

export default function SearchResultTimeline({
  results: _items,
  closeDialog,
  query,
}: {
  results: ISearchItemResult[] | null;
  closeDialog?: () => void;
  query?: string;
}) {
  const { state } = useGrid();
  const cols = state?.config?.gridColumns;

  const results = _items?.map((item) => {
    const _col = cols?.find((col) => col.accessorKey === item.field);
    return {
      ...item,
      label: _col?.header,
    };
  });

  const generateDynamicKeyValue = (key: string, value: string) => {
    if (key === 'raw_phone_number') {
      return {
        key: 'Phone Number',
        value: formatPhoneNumberClient({
          raw_phone_number: value,
          iso_code: 'EN',
        }),
      };
    }
    return {
      key: key
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value,
    };
  };

  const renderValue = ({
    isObject,
    result,
    display,
  }: {
    isObject: boolean;
    result: ISearchItemResult;
    display: any;
  }) => {
    if (isObject) {
      return (
        <>
          {Object.entries(display).map(([key, value]) => {
            const { key: newKey, value: newValue } = generateDynamicKeyValue(
              key,
              value as string,
            );

            return (
              <React.Fragment key={key}>
                <div className="mb-2 ml-3">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {newValue as any}
                  </span>
                </div>
                <Badge
                  className="hover:bg-primary/20"
                  key={key}
                  variant="primary"
                >
                  {newKey}
                </Badge>
              </React.Fragment>
            );
          })}
        </>
      );
    }
    return (
      <>
        <div className="mb-2 ml-3">
          <span className="text-sm font-semibold text-muted-foreground">
            {result?.display_value
              ? result?.display_value
              : result.values?.join(', ')}
          </span>
        </div>
        <Badge
          className="hover:bg-primary/20"
          key={result.id}
          variant="primary"
        >
          {result?.label}
        </Badge>
      </>
    );
  };

  const { actions } = useContext(SearchGridContext);
  if (!results)
    return (
      <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
        Searching...
      </h2>
    );
  return results?.length > 0 ? (
    <ul className="text-sm text-gray-700">
      {results?.map((result) => {
        let _display = result?.raw_value;
        let custom_key = ''
        let custom_value = ''
        const is_object = isObject(result?.raw_value);
        if (is_object) {
          _display = getValuesContainingSearch(result?.raw_value, query ?? '');
          custom_key = Object.keys(_display)[0]  ?? ''
          custom_value = _display[custom_key] ?? ''
        }

        if (!_display || isEmpty(_display)) {
          return null;
        }

        return (
          <>
            <ComboboxOption
              as="li"
              className="cursor-pointer rounded-md p-2 hover:bg-muted/70"
              key={result.id}
              value={result}
              onClick={() => {
                actions?.handleAddSearchItem(result, {
                  custom_value: custom_value,
                  key: custom_key,
                });
                closeDialog && closeDialog();
              }}
            >
              {renderValue({
                isObject: is_object,
                result,
                display: _display,
              })}
            </ComboboxOption>
            {results.length > 1 && <Separator className="m-2" dashed={true} />}
          </>
        );
      })}
    </ul>
  ) : (
    <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
      No Results Found
    </h2>
  );
}
