export const searchableFields = [
  // {
  //   accessorKey: 'interface_name',
  //   field: 'interface_name',
  //   label: 'Instance Name',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  {
    accessorKey: 'source_ip',
    field: 'source_ip',
    label: 'Source IP',
    entity: 'packets',
    operator: 'equal',
  },
  // {
  //   accessorKey: 'destination_ip',
  //   field: 'destination_ip',
  //   label: 'Destination IP',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  // {
  //   accessorKey: 'source_port',
  //   field: 'source_port',
  //   label: 'Source Port',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  // {
  //   accessorKey: 'destination_port',
  //   field: 'destination_port',
  //   label: 'Destination Port',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  // {
  //   accessorKey: 'protocol',
  //   field: 'protocol',
  //   label: 'Protocol',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  // {
  //   accessorKey: 'ether_type',
  //   field: 'ether_type',
  //   label: 'Ether Type',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  // {
  //   accessorKey: 'source_mac',
  //   field: 'source_mac',
  //   label: 'Source Mac Address',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
  // {
  //   accessorKey: 'destination_mac',
  //   field: 'destination_mac',
  //   label: 'Destination Mac Address',
  //   entity: 'packets',
  //   operator: 'equal',
  // },
]

export const searchConfig = {
  router: 'packet',
  resolver: 'filterPackets',
  defaultEntity: 'packets',
}

export const timeDuration = {
  time_count: 12,
  time_unit: 'hour' as 'hour',
  resolution: '1h',
}