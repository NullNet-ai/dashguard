import { ulid } from 'ulid'

const defaultTabs = [
  {
    name: `Default Secret Tab`,
    current: false,
    href: `/portal/user_role/grid?filter_id=`,
    default: true,
    default_filter: [
      {
        operator: 'equal',
        type: 'criteria',
        field: 'status',
        id: ulid(),
        label: 'Status',
        values: ['Draft'],
        default: true,
      },
    ],
  },
]

export default defaultTabs