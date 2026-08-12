'use client'

import { CardComponent as Card } from '~/components/ui/card/index';
// import { ISearchItem } from '~/components/platform/Grid/Search/types';
import Grid from '~/components/platform/Grid/';
import TimelineControl from '~/components/ui/timeline';
import { gridColumns, TO_HIDE_COLUMNS_WHEN_MOBILE } from './Config/columns';
import { ulid } from 'ulid';
import { useParams, usePathname } from 'next/navigation';
import { api } from '~/trpc/react';
import { useEffect, useMemo } from 'react';
import { Loader } from '~/components/ui/loader';
import TimelineComponent from './components/TimelineComponent';

// Move static arrays outside component to prevent recreation
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


const defaultSorting = [
  {
    id: 'timestamp',
    desc: true,
    sort_key: 'timestamp',
  },
];

export const customTabs = [
  {
    name: 'All Timeline',
    current: false,
    href: '/portal/contact/timeline?filter_id=',
    default: true,
    default_filter: [],
    group_advance_filters: [],
    advance_filters: [
      {
        type: 'criteria',
        field: 'status',
        operator: 'equal',
        values: ['Active', 'Draft'],
        label: 'Status',
        default: true,
      },
    ],
    hidden: false,
    order: 0,
    metadata: {
      item_width: 94,
    },
  },
]

const TimelineWizardRecord = () => {
    const pathname = usePathname()
  const [, , , application, identifier] = pathname.split('/');

  // Memoize defaultAdvanceFilter with stable ID
  const defaultAdvanceFilter = useMemo(() => [
    {
      operator: "equal",
      type: "criteria",
      field: "status",
      id: `status-filter-${identifier}`, // Use stable ID based on identifier
      label: "Status",
      values: ["Active", "Draft"],
      default: true,
    }
  ] as any[], [identifier]);

  const _default_filters = useMemo(() => [
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
        operator: 'or',
      },
      {
        operator: 'equal',
        type: 'criteria',
        field: 'parent_code',
        label: 'Parent Code',
        default: false,
        values: [identifier]
      },
  ] as any[], [identifier])

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


  const { data: refData , 
    refetch } =  api.timeline.timelineData.useQuery({
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
        operator: 'is_not_null',
        type: 'criteria',
        field: 'reference_id',
        label: 'Action',
        default: false,
      },
    ],
  });

  useEffect(() => {
    refetch();
  }, [identifier])


  const ref_id = refData?.data?.length ? refData?.data?.[0]?.reference_id ?? undefined : undefined;

  const { data, isLoading,  } =  api.timeline.timelineData.useQuery({
    pluck: _pluck,
    advanceFilter: [
      ..._default_filters,
      ...(ref_id !== undefined ? [
        {
          type: 'operator',
          operator: 'or',
        },
        {
          operator: 'equal',
          type: 'criteria',
          field: 'reference_id',
          label: 'reference_id',
          default: false,
          values: [ref_id]
        }
      ] : [])
    ],
  });


  const {data: items = []} = data ?? {};

  if(isLoading) {
    return  <div className='flex justify-center items-center h-full'>
       <Loader variant='circularShadow' size={'lg'} />
    </div>
  }

  return (
    <div className='side-drawer-timeline h-[calc(100dvh-120px)] overflow-scroll'>
      <Card className="space-y-2 !rounded-b-[8px] !rounded-t-[2px] ![overflow:unset]">
      <Grid
        isLoading={isLoading}
        defaultSorting={defaultSorting}
        grid_tabs={customTabs}
        // advanceFilter={_default_filters}
        totalCount={items?.length || 0}
        data={items}
        parentType='record'
        config={{
          showGridTab: false,
          searchDialog: 'timeline',
          viewMode: 'card',
          showScrollToTop: true,
          isInfinite: true,
          CustomRenderCardParent: TimelineComponent,
          hideCreateButton: true,
          entity: 'timeline',
          dimentionOptions: {
            gridStartPosition: 100,
          },
          metadata:{
            application: 'record'
          },
          title: 'Timeline',
          // columnsOrder: gridCacheData?.columns,
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
              group_advance_filters: []
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
    </div>
    
  );
};

export default TimelineWizardRecord;
