export const OPERATORS = [
    { value: 'equal', label: 'Equals', type : ['string', 'datetime', 'number'] },
    { value: 'not_equal', label: 'Not Equal', type : ['string', 'datetime', 'number' ]  },
    { value: 'greater_than', label: 'Greater Than', type : ['datetime', 'number'] },
    { value: 'greater_than_or_equal', label: 'Greater Than Or Equal', type : ['datetime', 'number'] },
    { value: 'less_than', label: 'Less Than', type : ['datetime', 'number']  },
    { value: 'less_than_or_equal', label: 'Less Than Or Equal', type : ['datetime', 'number']  },
    { value: 'contains', label: 'Contains', type : ['array'] },
    { value: 'not_contains', label: 'Not Contains', type : ['array']  },
    { value: 'is_empty', label: 'Is Empty', type: ['string', 'number', 'datetime'] },
    { value: 'is_not_empty', label: 'Is Not Empty', type: ['string', 'number', 'datetime'] },
    { value: 'is_between', label: 'Is Between', type: ['datetime', 'number'] },
    { value: 'is_not_between', label: 'Is Not Between', type: ['datetime', 'number'] },
    { value: 'like', label: 'Like', type: ['string', 'datetime']  },
  ];
  
  export const USE_REAL_API = true;
  export const USE_CUSTOM_RENDER = true;