export const OPERATORS = [
  { value: 'equal', label: 'Equals', type: ['string', 'datetime', 'number'] },
  {
    value: 'not_equal',
    label: 'Not Equal',
    type: ['string', 'datetime', 'number'],
  },
  { value: 'greater_than', label: 'After', type: ['datetime'] },
  {
    value: 'greater_than',
    label: 'Greater Than',
    type: ['number'],
  },
  {
    value: 'greater_than_or_equal',
    label: 'On or After',
    type: ['datetime'],
  },
  {
    value: 'greater_than_or_equal',
    label: 'Greater Than or Equal To',
    type: ['number'],
  },
  { value: 'less_than', label: 'Before', type: ['datetime'] },
  { value: 'less_than', label: 'Less Than', type: ['number'] },
  {
    value: 'less_than_or_equal',
    label: 'On or Before',
    type: ['datetime'],
  },
  {
    value: 'less_than_or_equal',
    label: 'Less Than or Equal To',
    type: ['number'],
  },
  { value: 'contains', label: 'Contains', type: ['string', 'array'] },
  { value: 'not_contains', label: 'Not Contains', type: ['string', 'array'] },
  {
    value: 'has_no_value',
    label: 'Is Empty',
    type: ['string', 'number', 'datetime'],
  },
  {
    value: 'is_not_empty',
    label: 'Is Not Empty',
    type: ['string', 'number', 'datetime'],
  },
  { value: 'is_between', label: 'Is Between', type: ['datetime', 'number'] },
  { value: 'is_not_between', label: 'Is Not Between', type: [] },
  { value: 'like', label: 'Like', type: [] },
];

export const USE_REAL_API = true;
export const USE_CUSTOM_RENDER = true;