'use client'
import { usePathname } from 'next/navigation'
import React from 'react'

import { api } from '~/trpc/react'

import useRefetchRecord from '../hooks/useFetchMainRecord'

const fields = {
  Categories: 'categories',
  Entity: 'entity',
}

const Summary = (props: { form_key: string }) => {
  const pathName = usePathname()

  const [, , entity, , identifier] = pathName.split('/')

  const {
    data: record = { data: { id: null } },
    refetch,
    error,
  } = api.record.getByCode.useQuery({
    main_entity: entity!,
    id: identifier!,
    pluck_fields: ['id', 'categories', 'entity'],
  })

  const { data } = record || {}

  useRefetchRecord({
    refetch,
    form_key: props.form_key,
  })

  if (error) {
    return (
      <div>
        Error:
        {error.message}
      </div>
    )
  }

  return (
    <div>
      {Object.entries(fields).map(([key, value]) => {
        if (key === 'Categories' && data[value]) {
          return data[value].map((category: any) => {
            return (
              <p className="mb-[8px] no-underline" key={key}>
                <strong>
                  {' '}
                  {key}
                  :
                  {' '}
                </strong>
                &nbsp;
                {' '}
                {category}
              </p>
            )
          })
        }

        return (
          <p className="mb-[8px] no-underline" key={key}>
            <strong>
              {' '}
              {key}
              :
              {' '}
            </strong>
            &nbsp;
            {' '}
            {data?.[value] || 'None'}
          </p>
        )
      })}
    </div>
  )
}

const StepTwoCategoryDetails = {
  label: 'Step 2',
  required: true,
  components: [
    {
      label: 'Record Details',
      component: <Summary form_key="UserRoleCategoryDetails" />,
    },
  ],
}

export default StepTwoCategoryDetails
