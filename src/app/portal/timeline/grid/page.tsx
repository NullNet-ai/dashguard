import Grid from '~/components/platform/Grid/';
import { getGridCacheData } from '~/components/platform/Grid/utils/grid-get-cache-data';
import { gridDataResolver } from '~/components/platform/Grid/utils/gridDataResolver';
import { api } from '~/trpc/server';
import { defaultAdvanceFilter } from './_config/advanceFilter';
import { gridColumns, TO_HIDE_COLUMNS_WHEN_MOBILE } from './_config/columns';
import { customTabs } from './_config/customGridTabs';
import { defaultSorting } from './_config/sorting';
import TimelineControl from '~/components/ui/timeline';
import { ColumnDef } from '@tanstack/react-table';
import DefaultTimelineComponent from '~/components/platform/timeline-components/TimelineComponent';

// import EditComponent from "./customDefaultActions/Edit";
export default async function Page() {
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
    'parent_code_new'
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
      defaultAdvanceFilter,
    },
  });


  const _gridProps = {
    ...gridProps,
    // advanceFilter: [ ],
    defaultAdvanceFilter: [],
  };

  const { data, count, all_record_counts } = await api.timeline.timelineData({
    pluck: _pluck,
    advanceFilter: gridParams?.advance_filters,
    limit: 50,
  });

  return (
    <Grid
      {..._gridProps}
      pagination={{
        limit_per_page: 50,
        current_page: 1,
      }}
      totalCount={all_record_counts || 0}
      data={data}
      config={{
        searchDialog: 'timeline',
        viewMode: 'card',
        showScrollToTop: true,
        isInfinite: true,
        CustomRenderCardParent: DefaultTimelineComponent,
        hideCreateButton: true,
        entity: 'timeline',
        dimentionOptions: {
          gridStartPosition: 100,
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
          resolver: 'timelineSearchInfinite',
          query_params: {
            pluck: _pluck,
            entity: 'timeline',
            advance_filters: gridParams?.advance_filters as any[],
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
  );
}
