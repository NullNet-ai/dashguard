import type { ColumnDef, GroupingState } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import StatusCell from '~/components/ui/status-cell';
import { type ISearchItem } from '../Search/types';
import type { IConfigGrid, TActionType } from '../types';

export const useColumnConditions = (
  config: IConfigGrid,
  grouping: GroupingState,
  newData: any[],
  selectTableRow: any,
  expandTableRow: any,
  actionRow: any,
  groupByColumn: any,
) => {
  const getArchivedColumn = (columns: any[]) => {
    const stateIndex = columns?.findIndex(
      (column) => column.header === 'State',
    );

    const newColumn = {
      header: 'Previous State',
      accessorKey: 'previous_status',
      cell: ({ row }) => {
        const value = row?.original?.previous_status;
        return <StatusCell value={value} />;
      },
    } as ColumnDef<any>;

    if (stateIndex !== -1) {
      return [
        ...columns.slice(0, stateIndex + 1),
        newColumn,
        ...columns.slice(stateIndex + 1),
      ];
    }

    return [...columns, newColumn];
  };

  const getGroupingColumn = (columns: any[]) => {
    const groupColumn = grouping[0] as string;
    const configColumns = config?.group_by_initial_columns || config?.columns;
    const columnConfig = configColumns?.find(
      (col: any) => col.accessorKey === groupColumn,
    );
    const column = {
      ...groupByColumn.current,
      cell: ({ row }: any) => {
        const value = row?.original?.formatted_value || '';
        if (!value && !row?.original.count) {
         return null;
        }

        if (columnConfig?.cell) {
          return (
            <>
              {(columnConfig as any).cell({
                row: { original: { [groupColumn]: value} },
              })}
              <div className="ml-1 flex items-center">
                <span className="text-sm font-semibold">{`(${row?.original.count})`}</span>
              </div>
            </>
          );
        }

        return (
          <>
            {flexRender<any>(
              columnConfig?.cell ||
                ((props: any) => <div>{String(props.getValue())}</div>),
              {
                row: { original: { [groupColumn]: value } },
                getValue: () => value,
              },
            )}
            <div className="ml-1 flex items-center">
              <span className="text-sm font-semibold">{`(${row?.original.count})`}</span>
            </div>
          </>
        );
      },
    };
    return [column, ...columns];
  };

  const actionTypeColumnCondition = (
    viewMode: string,
    defaultAdvanceFilter: ISearchItem[],
    actionsType?: TActionType,
  ) => {
    const isDefaultFilterArchived = defaultAdvanceFilter?.find(
      (filter) =>
        filter?.field === 'status' && filter?.values?.[0] === 'Archived',
    );

    let columns = config?.columns || [];

    if (isDefaultFilterArchived) {
      columns = getArchivedColumn(columns);
    }

    // Exclude selectTableRow and actionRow if view mode is 'card'
    if (viewMode === 'card') {
      if (
        (config?.enableGridGrouping && grouping.length) ||
        config?.enableRowExpansion ||
        grouping.length
      ) {
        columns = [expandTableRow?.current, ...columns];
      }

      return [...columns];
    }

    switch (actionsType) {
      case 'single-select':
        if (config?.disableDefaultAction) {
          return [...columns];
        }

        return [...columns, actionRow?.current];
      default:
        if (config?.enableGridGrouping && grouping.length && newData.length) {
          columns = getGroupingColumn(columns);
        }
        if (
          (config?.enableGridGrouping && grouping.length) ||
          config?.enableRowExpansion ||
          grouping.length
        ) {
          columns = [expandTableRow?.current, ...columns];
        }
        if (config?.enableRowSelection) {
          columns = [selectTableRow?.current, ...columns];
        }
        if (!config?.disableDefaultAction || config?.customRowAction) {
          columns = [...columns, actionRow?.current];
        }

        return columns;
    }
  };

  return {
    actionTypeColumnCondition,
  };
};
