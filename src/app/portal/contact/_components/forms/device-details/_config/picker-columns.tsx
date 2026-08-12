import { ColumnDef } from '@tanstack/react-table';

const pickerColumns = [
  {
    header: 'Device Name',
    accessorKey: 'device_name',
    search_config: {
      entity: 'devices',
      field: 'device_name',
      operator: 'like',
    },
  },
] as unknown as ColumnDef<any>[];

export default pickerColumns;
