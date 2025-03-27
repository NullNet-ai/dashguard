import { EClientDatabaseProvider, ORM } from '@dna-platform/common-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateQueryParamsFromTemplate } from '~/lib/template-parser';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';

const { ROOT_ACCOUNT_PASSWORD = 'pl3@s3ch@ng3m3!!' } = process.env;

export async function POST(request: Request) {
  try {
    // const body = await request.json();
    const orm = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    });
    const cookieStore = cookies();
    const { value: token = null } = cookieStore.get('token') || {};
    console.log('🚀 ~ POST ~ token:', token);
    // const token = await api.auth.getToken()
    if (!token) {
      return NextResponse.json({ message: 'No token found' }, { status: 401 });
    }

    const { data } = await orm
      .findAll({
        token,
        entity: 'communication_templates',
        query: {
          pluck: ['id', 'name', 'event', 'subject', 'content', 'status'],
          advance_filters: createAdvancedFilter({
            event: 'ACCOUNT_INVITE',
            status: 'Active',
            //categories: ['Email'],
          }),
        },
      })
      .execute();
    console.log('🚀 ~ POST ~ data:', data);
    const {
      subject,
      content,
    } = data?.[0] ?? {};

    // create a function that will replace the group
    
const queryParams = generateQueryParamsFromTemplate(subject, content);
console.log("🚀 ~ POST ~ queryParams:", queryParams)

    return NextResponse.json({
      success: true,
      data: {
        queryParams
      },
      message: 'Account Invitation sent successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
