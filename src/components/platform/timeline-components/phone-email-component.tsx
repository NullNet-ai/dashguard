'use client';

import React, { useState } from 'react';
import {  ChevronDown, ChevronUp, Code } from 'lucide-react';
import { capitalize, isArray, isEmpty } from 'lodash';
import { singular } from 'pluralize';
import { gotoWizardRecord } from '~/app/portal/timeline/grid/action/timeline-action';
import { useRouter } from 'next/navigation';
import { formatPhoneNumber } from '~/utils/formatter';
import { formatTextUnderScoreToSpace } from '~/components/ui/timeline/_components/util/formatter';
import { Badge } from '~/components/ui/badge';
import { getStringFormat } from '~/components/ui/timeline/_components/util/get-format';
import { useGrid } from '~/components/platform/Grid/Provider';
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog';
import Image from 'next/image';
import { Loader } from '~/components/ui/loader';

const excludedKeysForInsert = [
  'version',
  'updated_time',
  'updated_date',
  'updated_by',
  'timestamp',
  'created_time',
  'tombstone',
  'requested_by',
  'organization_id',
  'previous_status',
  'country_code',
  'created_date',
  'is_primary',
  'created_by',
  'contact_id',
  'iso_code',
  'id',
  'code',
  'org_metadata',
  'contact_organization_id',
  'status'
];

const excludedKeys = [
  'version',
  'updated_time',
  'updated_date',
  'updated_by',
  'timestamp',
  'created_time',
  'tombstone',
  'created_date',
  'previous_status',
  'org_metadata',
  'contact_organization_id',
  'status'
];

const childKeyConfig = {
  '_contacts': { entity: 'contact'},
  '_organizations': { entity: 'organization' },
  '_accounts': { entity: 'account'}
};

export const keyLabelsOverride = [
  {
    key: 'raw_phone_number',
    label: 'Phone Number',
  }
]

// Helper function to get override label or default formatted key
const getKeyLabel = (key: string): string => {
  const override = keyLabelsOverride.find(item => item.key === key);
  return override ? override.label : capitalize(formatTextUnderScoreToSpace(key));
};

interface DefaultComponentProps {
  item: any;
  toggleExpanded: (id: string) => void;
  expandedItems: Set<string>;
  showHeader?: boolean;
}

const PhoneEmailComponent = ({
  item,
  toggleExpanded,
  expandedItems,
  showHeader = true,
}: DefaultComponentProps) => {
  const [isUpdateExpanded, setIsUpdateExpanded] = useState(false);
  const [isInsertExpanded, setIsInsertExpanded] = useState(false);
  const { identifier,  } = item?.metadata?.referer || {};
  const entity = item?.metadata?.entity;
  const ref_id = item?.metadata?.reference_id;
  const {state: gridState} = useGrid()
  const {config, advanceFilter } = gridState || {}

  const [open, setOpen] = useState(false);
  const [image_url, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const getImageUrl = async (url?: string) => {
    const pro_url = process.env.NEXT_PUBLIC_ORIGIN_WEBSITE_URL
    const base_url = url ? url : `${pro_url}${item?.new_value?.download_path}`

    try {
      if(!base_url) {
        return '';
      }
      setLoading(true);
      const response = await fetch(base_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setLoading(false);
      return url;
    } catch (error) {
      console.error('Error fetching image:', error);
      setLoading(false);
      return null;
    }
  };


  const router = useRouter();

  const handleClick = async (code?: string) => {


    if(code === undefined || entity === undefined) {
      console.error('Identifier or entity is undefined');
      return;
    }
    

    const record = await gotoWizardRecord(
      identifier,
      entity,
      ref_id,
      config?.searchConfig?.query_params,
      code
    );

    if (record?.status) {
      const application = record?.status === 'Active' ? 'record' : 'wizard';
      let url = `/portal/${entity}/${application}/${code}/1`;
      if (application === 'record') {
        url = `/portal/${entity}/${application}/${code}/dashboard`;
      }

      router.push(url);
    }
  };

  const renderValue = (value: any, key: string, isOldValue?: boolean) => {

    if(value === null || value === undefined) {
      return 'empty';
    }
    if (isArray(value)) {
      return <div className='flex gap-1 flex-row'>
        {value.map((item) => 
        <Badge key={item} variant={'default'}>{item}</Badge>
      )}
      </div>
    }
    if(typeof value === 'string') {

      const stringFormat = getStringFormat(value);

      if(stringFormat ==='curly_braces' && !isOldValue) {
        return value.trim()
        .slice(1, -1)  // Remove first and last character
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, '')) // Remove quotes
        .filter(item => item !== '').map(item => <Badge key={item} variant={'default'}>{item}</Badge>)
      }

       if(key==='image_url') {
        return <button data-value={value} className={`cursor-pointer text-sm text-blue-500 text-left
          ${isOldValue ? 'font-medium text-danger line-through break-all' : ''}
            cursor-pointer text-sm text-blue-500 underline 
          `}
          onClick={ async () => {
            setOpen(true);
            const url = await getImageUrl(value);
            if(url) {
              setImageUrl(url);
            }
          }}
        >{value?.replace('/download', '')}</button>
      }

      if(key ==='raw_phone_number') {
        return formatPhoneNumber({
          iso_code:'US',
          raw_phone_number:value,
        });
      }

      if(key === 'record_updated_time') {
        return value.replace(/:\d{2}$/, '');
      }

      if(key === 'organization') {
        return item.parent_details.organization.name;
      }

      return value;
    }

  };

  const renderUpdatedDate = () => {
    const isUpdate = item?.action === 'UPDATE';

    return(
      <div className="flex gap-8 text-sm">
        {isUpdate && (
          <div className="flex-1 rounded-sm bg-slate-100 p-2">
            <label className="font-semibold text-gray-600">
              Updated Date
            </label>
            <p className="font-medium text-danger line-through break-all">
              {renderValue(item?.record_created_date, 'record_created_date')}
              {' '}
              {renderValue(item?.record_created_time, 'record_created_time')}
            </p>
          </div>
        )}
        <div className="flex-1 rounded-sm bg-slate-100 p-2">
          <label className="font-semibold text-gray-600">
            Updated Date
          </label>
          <p className="font-medium text-success break-all">
            {renderValue(item?.record_updated_date, 'record_updated_date')}
            {' '}
            {renderValue(item?.record_updated_time, 'record_updated_time')}
          </p>
        </div>
      </div>
    )
  };

  const renderChildLabel = (key: string) => {
    const matchedPattern = Object.keys(childKeyConfig).find(pattern => key.includes(pattern));

    if (matchedPattern) {
      const config = childKeyConfig[matchedPattern as keyof typeof childKeyConfig];
      const parentObject = item.parent_details?.[config.entity];

      if (parentObject?.code) {
        const handleParentClick = async () => {
          const record = await gotoWizardRecord(parentObject.code, config.entity, ref_id, gridState?.config?.searchConfig?.query_params, );

          if (record?.status) {
            const application = record.status === 'Active' ? 'record' : 'wizard';
            const url = application === 'record' 
              ? `/portal/${config.entity}/record/${parentObject.code}/dashboard`
              : `/portal/${config.entity}/${application}/${parentObject.code}/1`;
            router.push(url);
          }
        };

        return (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium capitalize text-gray-900">
              {capitalize(config.entity)}
            </span>
            <button
              type="button"
              onClick={handleParentClick}
              className="cursor-pointer text-sm text-blue-500 underline"
            >
              ({parentObject.code})
            </button>
          </div>
        );
      }
    }

    const parentTable = item?.table?.split('_')?.length > 1 ? item?.table?.split('_')?.[0] : '';
    
    let _item_code = ''
    if(!item.record_code?.includes('CTR')) {
      _item_code = item.record_code;
    }
    else if (item.parent_code_new) {
      _item_code = item.parent_code_new;
    } else if(parentTable && item.parent_details?.[singular(parentTable)]?.code) {
      _item_code = item.parent_details?.[singular(parentTable)]?.code;
    } else if(item.parent_code && item.parent_code !== 'new') { 
      _item_code = item.parent_code;
    }
    
    return (
      <div className={`mb-2 flex items-center phone-email-component gap-2 ref-id-${item.id} action-${item.action.toLowerCase()}`}>
        <span className="text-sm font-medium capitalize text-gray-900">
          {formatTextUnderScoreToSpace(singular(item.table))}
        </span>
         <button
            type="button"
            onClick={() => handleClick(_item_code)}
            className="cursor-pointer text-sm text-blue-500 underline"
          >
            {_item_code}
          </button>
      </div>
    );
  }

  return (
    <>
      {showHeader && renderChildLabel(item.table)}

      {/* Expandable Details */}
      {(!isEmpty(item?.new_value) || !isEmpty(item?.old_value)) &&
        item?.action !== 'INSERT' &&
        (() => {
          const filteredEntries = Object.entries({
            ...item?.old_value,
          })
            .filter(([key]) => !excludedKeys.includes(key))
            .filter(([key, value]) => {
              const oldValue = value;
              const newValue = item?.new_value[key];
              const isOldEmpty =
                oldValue === null || oldValue === undefined || oldValue === '';
              const isNewEmpty =
                newValue === null || newValue === undefined || newValue === '';
              return !(isOldEmpty && isNewEmpty) || (isOldEmpty && !isNewEmpty);
            });

          const shouldShowExpandButton = filteredEntries.length > 3;
          const displayedEntries = isUpdateExpanded
            ? filteredEntries
            : filteredEntries.slice(0, 3);

          return (
            <div className="flex flex-col gap-y-2">
              {displayedEntries.map(([key, value]) => (
                  <div key={key} className="flex gap-8 text-sm">
                    <div className="flex-1 rounded-sm bg-slate-100 p-2">
                      <div className="font-semibold text-gray-600">
                        {getKeyLabel(key)}
                      </div>
                      <div
                        className={`font-medium ${'text-danger line-through'} break-all`}
                      >
                        {renderValue(item?.old_value[key], key, true)}
                      </div>
                    </div>
                    <div className="flex-1 rounded-sm bg-slate-100 p-2">
                      <div className="font-semibold text-gray-600 ">
                        {getKeyLabel(key)}
                      </div>
                      <div className={`font-medium ${'text-success'} break-all`}>
                        {renderValue(item?.new_value[key], key)}
                      </div>
                    </div>
                  </div>
              ))}

              {/* Updated Date field */}
              {renderUpdatedDate()}

              {shouldShowExpandButton && (
                <button
                  onClick={() => setIsUpdateExpanded(!isUpdateExpanded)}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700" 
                >
                  <span>{isUpdateExpanded ? 'View less' : `View more`}</span>
                  {isUpdateExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          );
        })()}

      {item.action === 'INSERT' &&
        (() => {
          const filteredEntries = Object.entries({
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
            });

          if (item.table === 'organization_contacts' && item.parent_details?.organization?.name) {
            filteredEntries.unshift(['organization', item.parent_details.organization.name]);
          }

          const shouldShowExpandButton = filteredEntries.length > 3;
          const displayedEntries = isInsertExpanded
            ? filteredEntries
            : filteredEntries.slice(0, 3);

          return (
            <div className="flex flex-col gap-y-2">
              {displayedEntries.map(([key, value]) => (
                <div key={key} className="flex gap-8 text-sm">
                  <div className="flex-1 rounded-sm bg-slate-100 p-2">
                    <div className="font-semibold text-gray-600">
                      {getKeyLabel(key)}
                    </div>
                    <div className={`font-medium ${'text-success'}`}>
                       {renderValue(item?.new_value[key] || value, key)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Updated Date field */}
              {renderUpdatedDate()}

              {shouldShowExpandButton && (
                <button
                  onClick={() => setIsInsertExpanded(!isInsertExpanded)}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
                >
                  <span>{isInsertExpanded ? 'View less' : `View more`}</span>
                  {isInsertExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          );
        })()}

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
        <Dialog
          open={open}
          onOpenChange={(open) => {
            setOpen && setOpen(open);
          }}

        >
          <DialogContent className="w-1/2 bg-white md:w-2/3 p-2 max-w-[600px] min-h-[200px]">
           
            {(image_url && !loading) ? <Image src={image_url} alt="Dialog Image" className="w-full h-auto" /> : (
              <div className='flex items-center justify-center py-4 pt-12 min-h-[200px]'>  
                <Loader size='md' label='' variant='circularShadow' /> 
              </div>
            )}
          </DialogContent>
        </Dialog>
    </>
  );
};

PhoneEmailComponent.displayName = 'PhoneEmailComponent';

export default PhoneEmailComponent;
