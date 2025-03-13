import { ulid } from 'ulid'

import { type ISearchItem } from '~/components/platform/Grid/Search/types'
import { GLOBAL_PARENT_VARIABLE_KEY } from '../constants'

export const defaultAdvanceFilter = [
  {
    entity: `${GLOBAL_PARENT_VARIABLE_KEY}`,
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
    entity: `${GLOBAL_PARENT_VARIABLE_KEY}`,
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Draft'],
    default: true,
  },
  {
    operator: 'or',
    type: 'operator',
    default: true,
  },
  {
    entity: `${GLOBAL_PARENT_VARIABLE_KEY}`,
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Archived'],
    default: true,
  },
] as ISearchItem[]
