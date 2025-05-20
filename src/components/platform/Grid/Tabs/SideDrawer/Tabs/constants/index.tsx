export const OPERATORS = [
    { value: 'equal', label: 'Equals', type : ['string', 'datetime', 'number'] },
    { value: 'not_equal', label: 'Not Equal', type : ['string', 'datetime', 'number' ]  },
    { value: 'greater_than', label: 'After', type : ['datetime', 'number'] },
    { value: 'greater_than_or_equal', label: 'On or After', type : ['datetime', 'number'] },
    { value: 'less_than', label: 'Before', type : ['datetime', 'number']  },
    { value: 'less_than_or_equal', label: 'On or Before', type : ['datetime', 'number']  },
    { value: 'contains', label: 'Contains', type : ['string','array'] },
    { value: 'not_contains', label: 'Not Contains', type : ['string','array']  },
    { value: 'is_empty', label: 'Is Empty', type: ['string', 'number', 'datetime'] },
    { value: 'is_not_empty', label: 'Is Not Empty', type: ['string', 'number', 'datetime'] },
    { value: 'is_between', label: 'Is Between', type: ['datetime', 'number'] },
    { value: 'is_not_between', label: 'Is Not Between', type: [] },
    { value: 'like', label: 'Like', type: []  },
    
  ];
  
  export const USE_REAL_API = true;
  export const USE_CUSTOM_RENDER = true;