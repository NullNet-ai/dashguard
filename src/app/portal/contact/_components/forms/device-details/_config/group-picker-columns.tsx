import { ColumnDef } from '@tanstack/react-table';

const groupPickerColumns = [
  {
    header: 'Group Name',
    accessorKey: 'name',
    search_config: {
      entity: 'device_group_settings',
      field: 'name',
      operator: 'like',
    },
  },
] as unknown as ColumnDef<any>[];

export default groupPickerColumns;
