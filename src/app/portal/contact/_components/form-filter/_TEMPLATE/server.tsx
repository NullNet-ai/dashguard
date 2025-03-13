import { headers } from 'next/headers'
import MultipleFormFilters from './client'
import { ulid } from 'ulid'
import { GLOBAL_PARENT_VARIABLE_KEY } from './constants'
const FormServerFetch = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const _pluck = [
    'id',
    'code',
    'status',
    'created_date',
    'updated_date',
    'created_time',
    'updated_time',
  ]

  /**
   * 
   * ! Your code goes here
   * ! Request your data here
   * ! Trpc > defaultValues
   */

  const id = ulid();

  return (
    <div className='space-y-2'>
      <MultipleFormFilters
        defaultValues={{
          // ! 1 index is needed for the form to be displayed
          [GLOBAL_PARENT_VARIABLE_KEY]: [
            {
              // ! This is needed to have an initial form field
              id: ulid(),
              // ! Code is indicator for record been created or not
              code: "TEST",
            },
          ],
        }}
        params={{
          id,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
          pluck_fields: _pluck,
        }}
      />
    </div>
  )
}

export default FormServerFetch
