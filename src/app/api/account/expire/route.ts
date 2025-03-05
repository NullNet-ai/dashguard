import {
  EClientDatabaseProvider,
  EOperator,
  ORM,
} from '@dna-platform/common-orm'
import { NextResponse } from 'next/server'

import { isInvitationLinkExpired } from '~/app/invite/[id]/_actions/isInvitationLinkExpired'
import { EStatus } from '~/server/api/types'

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env

export async function POST() {
  try {
    const orm = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    })
    const rootAccount = await orm
      .rootLogin('root', ROOT_ACCOUNT_PASSWORD)
      .execute()
    const rootAccountToken = rootAccount?.data?.[0]?.token
    // Get all active invitations
    if (rootAccountToken) {
      const { data } = await orm
        .rootFindAll({
          entity: 'invitations',
          token: rootAccountToken,
          query: {
            advance_filters: [
              {
                type: 'criteria',
                field: 'status',
                operator: EOperator.EQUAL,
                values: [EStatus.ACTIVE],
              },
            ],
            pluck_object: {
              invitations: [
                'id',
                'account_id',
                'status',
                'updated_date',
                'expiration_date',
                'updated_time',
              ],
              organization_accounts: [
                'id',
                'status',
                'account_status',
              ],
            },
            order: {
              limit: 2,
            },
          },
        })
        .join({
          type: 'left',
          field_relation: {
            to: {
              entity: 'organization_accounts',
              field: 'id',
            },
            from: {
              entity: 'invitations',
              field: 'account_id',
            },
          },
        })
        .execute()

      const updatePromises = data?.map(async (record) => {
        if (isInvitationLinkExpired(record.invitations.updated_date, record.invitations.updated_time)) {
          // Always update invitation status to Archived
          await orm.update(record.invitations.id, {
            entity: 'invitations',
            token: rootAccountToken,
            mutation: {
              params: {
                status: 'Archived',
              },
            },
          }).execute()

          // Only update organization account if account_status is 'Pending Setup' or 'Invited'
          if (['Pending Setup', 'Invited'].includes(record.organization_accounts.account_status)) {
            await orm.update(record.invitations.account_id, {
              entity: 'organization_account',
              token: rootAccountToken,
              mutation: {
                params: {
                  account_status: 'Invitation Expired',
                },
              },
            }).execute()
          }
        }
      })

      if (updatePromises?.length) {
        await Promise.all(updatePromises)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Request processed successfully',
    })
  }
  catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 },
    )
  }
}
