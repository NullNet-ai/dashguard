import { EClientDatabaseProvider, ORM } from '@dna-platform/common-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { replaceTemplateVariables } from '~/lib/template-parser';
import { createAdvancedFilter } from '~/server/utils/transformAdvanceFilter';

export async function POST() {
  try {
    // const body = await request.json();
    const orm = ORM({
      storage_type: EClientDatabaseProvider.LOCAL,
    });
    const cookieStore = cookies();
    const { value: token = null } = cookieStore.get('token') || {};
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
    const {
      subject,
      content,
    } = data?.[0] ?? {};

    const templateData = {
      contact: {
        first_name: 'John',
        last_name: 'Doe'
      },
      organization_account: {
        id: 'john.doe@example.com'
      }
    };

    const parsedSubject = replaceTemplateVariables(subject, templateData);
    const parsedContent = replaceTemplateVariables(content, templateData);
    return NextResponse.json({
      success: true,
      data: {
        subject: parsedSubject,
        content: parsedContent,
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
