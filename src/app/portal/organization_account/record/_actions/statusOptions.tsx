'use client'
import { handleChangeStatus } from '~/app/portal/organization_account/record/_actions'
import { type IMenuOptionConfig } from '~/components/platform/Record/types'
const applicationStatuses = [
  'New',
  'Screening',
  'Assessment Test',
  'Interviewing',
  'Pending',
  'Hired',
  'Failed',
  'On Hold',
  'Job Offered',
]

export const accountStatuses = {
  'Disable Access': 'Access Disabled',
  'Deactivate Account': 'Deactivated',
  'Enable Access': 'Active',
  'Activate Account': 'Active',
  'Cancel Invitation': 'Invitation Canceled',
  'Resend Invitation': 'Invited',
  'Re-send Invite': 'Invited',
}

const statusOptions = [
  {
    label: 'Change Status',
    onClick: () => ({}),
    children: Object.entries(accountStatuses).map(([label, status]) => ({
      label,
      onClick: async (id, entityName) => {
        await handleChangeStatus(
          status, id, entityName, 'account_status',
        )
      },
    })),
  },
] as IMenuOptionConfig[]

export default statusOptions
