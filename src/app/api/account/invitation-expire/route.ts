import {
  EClientDatabaseProvider,
  ORM,
} from '@dna-platform/common-orm'
import { NextResponse } from 'next/server'

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orm = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    })
    const asRoot = true
    const rootAccount = await orm
      .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
      .execute()
    const rootAccountToken = rootAccount?.data?.[0]?.token
    const { account_id, invitation_id } = body ?? {}
    if (rootAccountToken && invitation_id && account_id) {
      await Promise.all([
        orm
          .update(invitation_id, {
            entity: 'invitations',
            token: rootAccountToken,
            mutation: {
              params: {
                status: 'Archived',
              },
            },
          })
          .execute(),
        orm
          .update(account_id, {
            entity: 'organization_account',
            token: rootAccountToken,
            mutation: {
              params: {
                account_status: 'Invitation Expired',
              },
            },
          })
          .execute(),
      ])
    }

    return NextResponse.json({
      success: true,
      data: {
        account_id,
        invitation_id,
      },
      message: 'Account Invitation expired successfully',
    })
  }
  catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 },
    )
  }
}
