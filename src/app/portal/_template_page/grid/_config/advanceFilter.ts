import { ulid } from 'ulid';
import type { ISearchItem } from '~/components/platform/Grid/Search/types';

const defaultAdvanceFilter = [
  {
    operator: 'equal',
    type: 'criteria',
    field: 'status',
    id: ulid(),
    label: 'Status',
    values: ['Active', 'Draft'],
    default: true,
  },
] as ISearchItem[];

export default defaultAdvanceFilter;
