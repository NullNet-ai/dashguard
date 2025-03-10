export const searchableFields = [
  {
    accessorKey: 'interface_name',
    field: 'interface_name',
    label: 'Instance Name',
    entity: 'packets',
    operator: 'like',
  },
  {
    accessorKey: 'source_ip',
    field: 'source_ip',
    label: 'Source IP',
    entity: 'packets',
    operator: 'like',
  },
  {
    accessorKey: 'destination_ip',
    field: 'destination_ip',
    label: 'Destination IP',
    entity: 'packets',
    operator: 'like',
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