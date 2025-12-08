import { type IGroupBy } from '~/components/platform/Grid/Category/type'

export const defaultGrouping: IGroupBy[] = [
  {
    label: 'State',
    value: 'status',
    field: 'contact.status',
    desc: false,
  },
]
