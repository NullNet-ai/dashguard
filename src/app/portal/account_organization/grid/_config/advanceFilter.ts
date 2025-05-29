import { ulid } from 'ulid'

import { type ISearchItem } from '~/components/platform/Grid/Search/types'
// ** This is initial advance filter for the <entity> module

const defaultAdvanceFilter = [
  {
    entity: 'account_organization',
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ["Active", "Draft"],
    default: true,
  }
] as ISearchItem[]

export default defaultAdvanceFilter
