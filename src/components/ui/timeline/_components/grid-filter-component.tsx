'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '~/lib/utils';
import { type TimelineItem } from '../types';
import Link from 'next/link';
import { formatTextUnderScoreToSpace } from './util/formatter';
import { singular } from 'pluralize';
import { capitalize, isArray, isEmpty, upperCase } from 'lodash';
import { Badge } from '../../badge';

export const keyLabelsOverride = [
  {
    key: 'raw_phone_number',
    label: 'Phone Number',
  },
];

// Helper function to get override label or default formatted key
const getKeyLabel = (key: string): string => {
  const override = keyLabelsOverride.find((item) => item.key === key);
  return override
    ? override.label
    : capitalize(formatTextUnderScoreToSpace(key));
};

interface DefaultComponentProps {
  item: any;
  toggleExpanded: (id: string) => void;
  expandedItems: Set<string>;
}

const excludedKeysForInsert = [
  'version',
  'updated_time',
  'updated_by',
  'timestamp',
  'created_time',
  // 'deleted_by',
  'updated_date',
  'tombstone',
  'link',
  'entity',
  'requested_by',
  'organization_id',
  'previous_status',
  'created_date',
  'created_by',
  'contact_id',
  'iso_code',
  'id',
  'code',
  // 'is_current',
  // 'is_default',
  'account_organization_id',
  'status',
  'previous_status',
];

const excludedKeys = [
  'version',
  'updated_time',
  'updated_by',
  'timestamp',
  'created_time',
  // 'deleted_by',
  'updated_date',
  'tombstone',
  'created_date',
  // 'is_current',
  // 'is_default',
  'account_organization_id',
  'link',
  'entity',
  'status',
  'previous_status',
];

const GridFilterComponent = ({
  item,
  toggleExpanded,
  expandedItems,
}: DefaultComponentProps) => {

  const [isUpdateExpanded, setIsUpdateExpanded] = useState(false);
  const [isInsertExpanded, setIsInsertExpanded] = useState(false);

  const renderItem = (key: string, value: any, isPrevValue?: boolean) => {
    if (key === 'columns') {
      return (
        <div className="my-4 flex flex-wrap gap-1">
          {value?.map((val: any, index: number) => {
            return (
              <div key={index} className="flex items-center gap-1">
                <Badge variant={'default'}>{val.label}</Badge>
              </div>
            );
          })}
        </div>
      );
    } else if (key === 'sorts' || key === 'groups') {
      return (
        <div className="my-2 flex flex-col gap-1">
          {value?.map((val: any, index: number) => {
            return (
              <div key={index} className="flex items-center gap-1">
                <div className={cn('text-success', { 'text-danger line-through': isPrevValue })}>
                  {capitalize(formatTextUnderScoreToSpace(val.sort_key || val.label))}:
                </div> 
                <div className={cn({ 'text-danger line-through': isPrevValue })}>{val?.desc ? 'Descending' : 'Ascending'}</div>
              </div>
            );
          })}
        </div>
      );
    } else if (key === 'filter_groups') {
      return (
        <div className="my-2 flex flex-col gap-1">
          {value?.map((val: any, index: number) => {
            return (
              <div key={index} className="flex items-center gap-1">
                <div className="text-success">
                  {capitalize(formatTextUnderScoreToSpace(val.sort_key))}
                </div>
                <div>
                  {val?.filters?.map((filter: any, index: number) => {
                    return (
                      <div key={index}>
                        {filter.type === 'criteria' ? (
                          <div className="flex flex-col gap-1">
                            <div>
                              <span className="text-success">Type: </span>{' '}
                              {capitalize(
                                formatTextUnderScoreToSpace(filter.type),
                              )}
                            </div>
                            <div>
                              <span className="text-success">Field: </span>{' '}
                              {capitalize(
                                formatTextUnderScoreToSpace(filter.field),
                              )}
                            </div>
                            <div>
                              <span className="text-success">Operator: </span>{' '}
                              {capitalize(
                                formatTextUnderScoreToSpace(filter.operator),
                              )}
                            </div>
                            <div className="flex flex-row items-center gap-1">
                              {' '}
                              <span className="text-success">
                                Values:{' '}
                              </span>{' '}
                              {typeof filter.values === 'string' ? (
                                filter.values
                              ) : (
                                <>
                                  <div className="flex gap-1">
                                    {filter?.values?.map((val: any) => {
                                      return (
                                        <Badge key={val} variant={'default'}>
                                          {val}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-success">
                              Type:{' '}
                              {capitalize(
                                formatTextUnderScoreToSpace(filter.type),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (key === 'advance_filters') {
      return (
        <div className="my-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {value?.map((filter: any, index: number) => {
              return (
                <div key={index}>
                  {filter.type === 'criteria' ? (
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-success">Type: </span>{' '}
                        {capitalize(formatTextUnderScoreToSpace(filter.type))}
                      </div>
                      <div>
                        <span className="text-success">Field: </span>{' '}
                        {capitalize(formatTextUnderScoreToSpace(filter.field))}
                      </div>
  
                      <div>
                        <span className="text-success">Operator: </span>{' '}
                        {capitalize(
                          formatTextUnderScoreToSpace(filter.operator),
                        )}
                      </div>
                      <div className="flex flex-row items-center gap-1">
                        {' '}
                        <span className="text-success">Values: </span>{' '}
                        {typeof filter.values === 'string' ? (
                          filter.values
                        ) : (
                          <>
                            <div className="flex gap-1">
                              {filter?.values?.map((val: any) => {
                                return (
                                  <Badge key={val} variant={'default'}>
                                    {val}
                                  </Badge>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-success">
                        Type:{' '}
                        {capitalize(formatTextUnderScoreToSpace(filter.type))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (key === 'record_updated_time' && typeof value === 'string') {
      const timeWithoutSeconds = value.replace(/:\d{2}$/, '');
      return (
        <div className={`font-medium ${isPrevValue ? 'text-danger line-through' : 'text-success'}`}>
          {timeWithoutSeconds}
        </div>
      );
    }

    return (
      <div className={`font-medium ${isPrevValue ? 'text-danger line-through' : 'text-success'}`}>
        {value === null || value === undefined
          ? 'null'
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value as string)}
      </div>
    );
  };

  const renderUpdatedDate = () => {
    return (
      <div className="flex gap-8 text-sm">
        <div className="flex-1 rounded-sm bg-slate-100 p-2">
          <label className="font-semibold text-gray-600">
            Updated Date
          </label>
          <p className="flex gap-1 font-medium text-success">
            {renderItem('record_updated_date', item?.record_updated_date)}
            {' '}
            {renderItem('record_updated_time', item?.record_updated_time)}
          </p>
        </div>
      </div>
    )
  }

  const responsibleName = item?.responsible_account_full_name;

  if (
    !isEmpty(item?.new_value?.is_current) &&
    !isEmpty(item?.old_value?.is_current)
  ) {
    return null;
  }

  return (
    <>
      <div className={`mb-2 flex items-center gap-2 item-component-grid-filter ref-id-${item.id}`}>
        <span className="text-sm font-medium capitalize text-gray-900">
          {formatTextUnderScoreToSpace(
            `${capitalize(item?.parent_details?.entity)} ${singular(item.table)}`,
          )}
        </span>
        {/* {!item.record_code?.includes('CTR') ? (
          <button
            // href={`/portal/contact/record/${item.record_code}/contact`}
            type="button"
            onClick={handleClick}
            className="cursor-pointer text-sm text-blue-500 underline"
          >
            ({item.record_code})
          </button>
        ) : null} */}
      </div>

      {/* Expandable Details */}
      {(!isEmpty(item?.new_value) || !isEmpty(item?.old_value)) &&
        item?.action !== 'INSERT' && (
          <div className="flex flex-col gap-y-2">
            {Object.entries({
              ...item?.old_value,
            })
              .filter(([key]) => !excludedKeys.includes(key))
              .filter(([key, value]) => {
                const oldValue = value;
                const newValue = item?.new_value[key];
                const isOldEmpty =
                  oldValue === null ||
                  oldValue === undefined ||
                  oldValue === '';
                const isNewEmpty =
                  newValue === null ||
                  newValue === undefined ||
                  newValue === '';
                return (
                  !(isOldEmpty && isNewEmpty) || (isOldEmpty && !isNewEmpty)
                );
              })
              .slice(0, isUpdateExpanded ? undefined : 3)
              .map(([key, value]) => {
                let theValue = String(item?.new_value[key]);
                if (key === 'deleted_by') {
                  theValue = responsibleName;
                }

                const parseValue = (str: string) => {
                  try {
                    return JSON.parse(str);
                  } catch {
                    return str;
                  }
                };

                const oldValue = parseValue(String(item?.old_value[key]));
                const newValue = parseValue(String(item?.new_value[key]));

                return (
                  <div key={key} className="flex gap-8 text-sm">
                    <div className="flex-1 rounded-sm bg-slate-100 p-2">
                      <div className="font-semibold text-gray-600">
                        {getKeyLabel(key)}
                      </div>
                        {renderItem(key, oldValue, true)}
                    </div>
                    <div className="flex-1 rounded-sm bg-slate-100 p-2">
                      <div className="font-semibold text-gray-600">
                        {getKeyLabel(key)}
                      </div>
                        {renderItem(key, newValue)}
                    </div>
                  </div>
                );
              })}

            {/* Updated Date field */}
            {renderUpdatedDate()}

            {Object.entries({
              ...item?.old_value,
            })
              .filter(([key]) => !excludedKeys.includes(key))
              .filter(([key, value]) => {
                const oldValue = value;
                const newValue = item?.new_value[key];
                const isOldEmpty =
                  oldValue === null ||
                  oldValue === undefined ||
                  oldValue === '';
                const isNewEmpty =
                  newValue === null ||
                  newValue === undefined ||
                  newValue === '';
                return (
                  !(isOldEmpty && isNewEmpty) || (isOldEmpty && !isNewEmpty)
                );
              }).length > 3 && (
              <button
                onClick={() => setIsUpdateExpanded(!isUpdateExpanded)}
                className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
              >
                <span>{isUpdateExpanded ? 'View less' : 'View more'}</span>
                {isUpdateExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )}

      {item.action === 'INSERT' && (
        <div className="flex flex-col gap-y-2">
          {Object.entries({
            ...item?.new_value,
          })
            .filter(([key]) => !excludedKeysForInsert.includes(key))
            .filter(([key, value]) => {
              return !(
                value === null ||
                value === undefined ||
                value === '' ||
                (isArray(value) && value?.length === 0)
              );
            })
            .slice(0, isInsertExpanded ? undefined : 3)
            .map(([key, value]) => {
              return (
                <div key={key} className="flex gap-8 text-sm">
                  <div className="flex-1 rounded-sm bg-slate-100 p-2">
                    <div className="font-semibold text-gray-600">
                      {getKeyLabel(key)}
                    </div>
                    {renderItem(key, value)}
                  </div>
                </div>
              );
            })}

          {/* Updated Date field */}
          {renderUpdatedDate()}

          {Object.entries({
            ...item?.new_value,
          })
            .filter(([key]) => !excludedKeysForInsert.includes(key))
            .filter(([key, value]) => {
              return !(
                value === null ||
                value === undefined ||
                value === '' ||
                (isArray(value) && value?.length === 0)
              );
            }).length > 3 && (
            <button
              onClick={() => setIsInsertExpanded(!isInsertExpanded)}
              className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
            >
              <span>{isInsertExpanded ? 'View less' : 'View more'}</span>
              {isInsertExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      )}

      {/* {item.new_value && (
          <>
            <div className="mt-3">
              {item.details.changes?.map((change, changeIndex) => (
                <div key={changeIndex} className="flex gap-8 text-sm">
                  <div className="flex-1">
                    <div className="text-gray-600">{change.field}</div>
                    <div
                      className={`font-medium ${
                        change.oldValueColor || 'text-gray-900'
                      }`}
                    >
                      {change.oldValue}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-600">{change.field}</div>
                    <div
                      className={`font-medium ${
                        change.newValueColor || 'text-gray-900'
                      }`}
                    >
                      {change.newValue}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => toggleExpanded(item.id)}
              className="mt-3 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
            >
              <span>view more</span>
              {expandedItems.has(item.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedItems.has(item.id) && (
              <div className="mt-3 rounded border bg-white p-3 text-sm">
                <p className="text-gray-600">
                  Additional details would appear here...
                </p>
              </div>
            )}
          </>
        )} */}
    </>
  );
};

GridFilterComponent.displayName = 'GridFilterComponent';

export default GridFilterComponent;
