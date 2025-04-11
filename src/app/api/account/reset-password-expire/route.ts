import { EClientDatabaseProvider, ORM } from '@dna-platform/common-orm';
import { NextResponse } from 'next/server';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orm = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    });
    const asRoot = true;
    const rootAccount = await orm
      .login('root', ROOT_ACCOUNT_PASSWORD, asRoot)
      .execute();
    const rootAccountToken = rootAccount?.data?.[0]?.token;
    const { invitation_id } = body ?? {};
    if (rootAccountToken && invitation_id) {
      await orm
        .update(invitation_id, {
          entity: 'invitations',
          token: rootAccountToken,
          as_root: true,
          mutation: {
            params: {
              status: 'Archived',
            },
          },
        })
        .execute();
    }

    return NextResponse.json({
      success: true,
      data: {
        invitation_id,
      },
      message: 'Reset Password Link expired successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
