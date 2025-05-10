export const addCommonGridPluckObject = () => {
  const pluck_object = {
    created_by_account_organizations: ['id'],
    created_by: ['id', 'first_name', 'last_name'],
    updated_by_account_organizations: ['id'],
    update_by: ['id', 'first_name', 'last_name'],
  }
  return pluck_object
}

export const addCommonGridConcatenates = () => {
  const concatenate_fields = [
    {
      fields: ['first_name', 'last_name'],
      field_name: 'full_name',
      separator: ' ',
      entity: 'contacts',
      aliased_entity: 'created_by',
    },
    {
      fields: ['first_name', 'last_name'],
      field_name: 'full_name',
      separator: ' ',
      entity: 'contacts',
      aliased_entity: 'updated_by',
    },
    {
      fields: ['created_date', 'created_time'],
      field_name: 'created_date_time',
      separator: ' ',
      entity: 'contacts',
    },
    {
      fields: ['updated_date', 'updated_time'],
      field_name: 'updated_date_time',
      separator: ' ',
      entity: 'contacts',
    },
  ]
  return concatenate_fields
}

// Helper function to add standard joins (created by and updated by) to a query
export const addCommonGridJoins = (query: any, ENTITY: string) => {
  return query
    .join({
      type: 'left',
      field_relation: {
        to: {
          alias: 'created_by_account_organizations',
          entity: 'account_organizations',
          field: 'id',
        },
        from: {
          entity: ENTITY,
          field: 'created_by',
        },
      },
    })
    .nestedJoin({
      type: 'left',
      nested: true,
      field_relation: {
        to: {
          alias: 'created_by',
          entity: 'contact',
          field: 'id',
        },
        from: {
          entity: 'account_organizations',
          field: 'created_by',
        },
      },
    })
    .join({
      type: 'left',
      field_relation: {
        to: {
          alias: 'updated_by_account_organizations',
          entity: 'account_organizations',
          field: 'id',
        },
        from: {
          entity: ENTITY,
          field: 'updated_by',
        },
      },
    })
    .nestedJoin({
      type: 'left',
      nested: true,
      field_relation: {
        to: {
          alias: 'updated_by',
          entity: 'contact',
          field: 'id',
        },
        from: {
          entity: 'account_organizations',
          field: 'updated_by',
        },
      },
    })
}
