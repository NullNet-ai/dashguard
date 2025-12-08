import { api } from '~/trpc/server';
import { headers } from 'next/headers';
import { CardComponent as Card } from '~/components/ui/card/index';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { defaultAdvanceFilter } from './config';
import { ISearchItem } from '~/components/platform/Grid/Search/types';
import Grid from '~/components/platform/Grid/';
import TimelineControl from '~/components/ui/timeline';
import { gridColumns, TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { EOperator } from '@dna-platform/common-orm';
import { values } from 'lodash';
import { customTabs } from './_config/customGridTabs';

const FormServerFetch = async () => {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const [, , , application, identifier] = pathname.split('/');

  const _default_filters = [
    ...defaultAdvanceFilter,
    {
      type: 'operator',
      operator: 'and',
    },
    {
      operator: 'equal',
      type: 'criteria',
      field: 'record_code',
      label: 'Record Code',
      values: [identifier],
      default: false,
    },
       {
        type: 'operator',
        operator: EOperator.OR,
      },
      {
        operator: EOperator.EQUAL,
        type: 'criteria',
        field: 'parent_code',
        label: 'Parent Code',
        default: false,
        values: [identifier]
      },
  ] as ISearchItem[];

  const defaultSorting = [
    {
      id: 'timestamp',
      desc: true,
      sort_key: 'timestamp',
    },
  ];

  const _pluck = [
    'id',
    'status',
    'record_id',
    'record_code',
    'request_context',
    'event_id',
    'event_name',
    'tombstone',
    'table',
    'action',
    'old_value',
    'new_value',
    'record_created_date',
    'record_created_time',
    'record_updated_time',
    'record_updated_date',
    'responsible_id',
    'responsible_account_id',
    'timestamp',
    'responsible_role_id',
    'responsible_role_name',
    'responsible_organization_id',
    'responsible_device_id',
    'responsible_contact_id',
    'responsible_account_full_name',
    'responsible_organization_name',
    'responsible_account_organization_id',
    'organization_id',
    'status_code',
    'status_message',
    'metadata',
    'reference_id',
    'parent_code',
  ];

  const gridCacheData =
    (await getGridCacheData({
      defaultGridTabs: customTabs,
      defaultSorting,
    })) ?? {};



  const { gridParams, gridProps } = gridDataResolver({
    entity: 'timeline',
    pluck: _pluck,
    gridCacheData,
    defaults: {
      defaultSorting,
      defaultAdvanceFilter: _default_filters,
    },
  });

  const _gridProps = {
    ...gridProps,
    // advanceFilter: [ ],
    defaultAdvanceFilter: [],
  };

  const { data: ref_data } = await api.timeline.timelineData({
    pluck: _pluck,
    advanceFilter: [
      ...defaultAdvanceFilter,
      {
        type: 'operator',
        operator: 'and',
      },
      {
        operator: 'equal',
        type: 'criteria',
        field: 'record_code',
        label: 'Record Code',
        values: [identifier],
        default: false,
      },
      {
        type: 'operator',
        operator: 'and',
      },
      {
        operator: 'equal',
        type: 'criteria',
        field: 'action',
        label: 'Action',
        values: ['INSERT'],
        default: false,
      },
      {
        type: 'operator',
        operator: 'and',
      },
      {
        operator: EOperator.IS_NOT_NULL,
        type: 'criteria',
        field: 'reference_id',
        label: 'Action',
        default: false,
      },
    ],
  });

  const ref_id = ref_data?.[0]?.reference_id;

  const { data } = await api.timeline.timelineData({
    pluck: _pluck,
    advanceFilter: [
      ..._default_filters,
      {
        type: 'operator',
        operator: EOperator.OR,
      },
      {
        operator: EOperator.EQUAL,
        type: 'criteria',
        field: 'reference_id',
        label: 'reference_id',
        default: false,
        values: [ref_id]
      }
    ],
  });

  return (
    <Card className="space-y-2 !rounded-b-[8px] !rounded-t-[2px] ![overflow:unset]">
      <Grid
        {..._gridProps}
        totalCount={data?.length || 0}
        data={data}
        parentType='record'
        config={{
          searchDialog: 'timeline',
          viewMode: 'card',
          showScrollToTop: true,
          isInfinite: true,
          CustomRenderCardParent: TimelineControl,
          hideCreateButton: true,
          entity: 'timeline',
          dimentionOptions: {
            gridStartPosition: 100,
          },
          metadata:{
            application: 'record'
          },
          title: 'Timeline',
          columnsOrder: gridCacheData?.columns,
          columns: gridColumns,
          // defaultValues: {
          //   categories: ['Contact', 'Employee'],
          //   id: 'code',
          // },
          paginationType: 'default',
          // defaultShownColumns: ['raw_phone_number', 'email'],
          enableAutoCreate: false,
          hideColumnsOnMobile: TO_HIDE_COLUMNS_WHEN_MOBILE,
          searchConfig: {
            router: 'timeline',
            resolver: 'mainGrid',
            query_params: {
              entity: 'timeline',
              pluck: [
                'id',
                'new_value',
                'responsible_account_full_name',
                'record_created_date',
                'responsible_role_name',
                'record_code',
                'record_id',
                'table',
                'action',
                'event_id',
              ],
              group_advance_filters:
                gridCacheData?.filters?.groupAdvanceFilters,
            },
          },
          searchSuggestionConfig: {
            router: 'timeline',
            resolver: 'timelineSearch',
          },
          customTabDefaults: {
            defaultSorting,
          },
          showPagination: false,
          removeResetSorting: true,
          isCreatable: false,
        }}
      />
    </Card>
  );
};

export default FormServerFetch;
