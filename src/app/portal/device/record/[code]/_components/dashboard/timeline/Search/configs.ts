export const searchableFields = [
  {
    accessorKey: 'interface_name',
    field: 'interface_name',
    label: 'Instance Name',
    entity: 'packets',
    operator: 'equal',
  },
  {
    accessorKey: 'source_ip',
    field: 'source_ip',
    label: 'Source IP',
    entity: 'packets',
    operator: 'equal',
  },
  {
    accessorKey: 'destination_ip',
    field: 'destination_ip',
    label: 'Destination IP',
    entity: 'packets',
    operator: 'equal',
  },
]

export const searchConfig = {
  router: 'packet',
  resolver: 'filterPackets',
  defaultEntity: 'packets',
}

export const timeDuration = {
  time_count: 1,
  time_unit: 'minute',
}