import { ulid } from 'ulid'

import { type ISearchItem } from '~/components/platform/Grid/Search/types'
// ** This is initial advance filter for the <entity> module

const defaultAdvanceFilter = [
  {
    entity: 'organization_account',
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Active'],
    default: true,
  },
  {
    operator: 'or',
    type: 'operator',
    default: true,
  },
  {
    entity: 'organization_account',
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Draft'],
    default: true,
  },
] as ISearchItem[]

export default defaultAdvanceFilter
