'use client'
import { usePathname } from 'next/navigation'

import { api } from '~/trpc/react'

import useRefetchRecord from '../hooks/useFetchMainRecord'

const Summary = ({ form_key }: { form_key: string }) => {
  const pathName = usePathname()
  const [, , , _, identifier] = pathName.split('/')
  const {
    data: record,
    refetch,
    error,
    isLoading,
  } = api.account.fetchExternalInternalUserDetails.useQuery({
    code: identifier!,
  })

  useRefetchRecord({
    refetch,
    form_key,
  })

  if (error) {
    return (
      <div>
        {"Error:"}
        {error.message}
      </div>
    )
  }
  if (isLoading) return null

  return record?.categories?.includes('External User')
    ? (
        <div>
          <p className='mb-[8px] no-underline'>
            <strong>{' Role: '}</strong>
        &nbsp;
            {record?.role || 'None'}
          </p>
          <p className='mb-[8px] no-underline'>
            <strong>{' Email: '}</strong>
        &nbsp;
            {record?.account_email || 'None'}
          </p>
        </div>
      )
    : (
        <div>
          <p className='mb-[8px] no-underline'>
            <strong>{' Primary Phone Number: '}</strong>
        &nbsp;
            {record?.contact?.phone || 'None'}
          </p>
          <p className='mb-[8px] no-underline'>
            <strong>{' Primary Email: '}</strong>
        &nbsp;
            {record?.contact?.email || 'None'}
          </p>
          <p className='mb-[8px] no-underline'>
            <strong>{' First Name: '}</strong>
        &nbsp;
            {record?.contact?.first_name || 'None'}
          </p>
          <p className='mb-[8px] no-underline'>
            <strong>{' Last Name: '}</strong>
        &nbsp;
            {record?.contact?.last_name || 'None'}
          </p>
          <p className='mb-[8px] no-underline'>
            <strong>{' Middle Name: '}</strong>
        &nbsp;
            {record?.contact?.middle_name || 'None'}
          </p>
        </div>
      )
}

// const SummaryConfig = () => {
//   const category = useCategory();
//   return ({
//     label: category === 'External User' ? 'Invite External User' : 'Selelct Internal User',
//     required: true,
//     components: [
//       {
//         label: category === 'External User' ? 'External User Details' : 'User Details',
//         component: <Summary form_key="BasicDetails" />,
//       },
//     ],
//   })
// };

const SummaryConfig = {
  label: 'Step 2',
  required: true,
  components: [
    {
      label: 'User Details',
      component: <Summary form_key='UserDetails' />,
    },
  ],
}

export default SummaryConfig
