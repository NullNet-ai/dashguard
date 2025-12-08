import { type IGroupBy } from '~/components/platform/Grid/Category/type'

// TODO: Customize the default grouping for your module
export const defaultGrouping: IGroupBy[] = [
  {
    label: 'Status', // TODO: Change this to your preferred grouping field
    value: 'status',
    field: 'template.status', // TODO: Change 'template' to your entity name
    desc: false,
  },
]