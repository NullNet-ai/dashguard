'use client';
import { useContext, useMemo } from 'react';
import useRefetchRecord from '../hooks/useFetchMainRecord';
import { api } from '~/trpc/react';
import { formatPhoneNumber } from '~/utils/formatter';
import { cn } from '~/lib/utils';
import { Separator } from '~/components/ui/separator';
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import { testIDFormatter } from '~/utils/formatter';
import { CardComponent as Card } from '~/components/ui/card/index';
import { useRecord } from '~/components/platform/Record/Provider';

const fields = {
  'Primary Phone Number': 'phone',
  'Primary Email': 'email',
  'Full Name': 'full_name',
  'Date of Birth': 'date_of_birth',
  Address: 'address',
  Department: 'organization',
};

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {
  const {
    data: record = { data: { id: null } },
    refetch: refetchPhoneAndEmail,
    error: _error,
  } = api.contact.fetchContactPhoneEmail.useQuery({
    code: identifier!,
    pluck_fields: ['id'],
  });

  const { isCollapseRecordSummary } =
  useContext(RecordWrapperContext);

    const {state: recordState} = useRecord() || {};

  const {
    emails: _email,
    phones: _phone,
    account,
  } = record as unknown as Record<string, any>;
  const email = useMemo(() => {
    const primary_email = _email?.find(
      ({ is_primary }: { is_primary: boolean }) => is_primary,
    );
    return primary_email?.email || 'None';
  }, [_email]);

  const phone = useMemo(() => {
    const primary_phone = _phone?.find(
      ({ is_primary }: { is_primary: boolean }) => is_primary,
    );
    const { raw_phone_number, iso_code } = primary_phone || {};
    const format_phone = formatPhoneNumber({
      raw_phone_number,
      iso_code,
    });
    return format_phone || 'None';
  }, [_phone]);

  const {
    data,
    refetch: refetchContactDetails,
    error,
  } = api.contact.getContactWithAddress.useQuery({
    code: identifier!,
    pluck_fields: [
      'id',
      'first_name',
      'last_name',
      'middle_name',
      'date_of_birth',
      'address_id',
    ],
  });

  const {
    data: org_record = {
      data: {
        organizations: [],
        user_roles: [],
      },
    },
    refetch: refetchOrg,
  } = api.organizationContact.fetchOrganizations.useQuery({
    code: identifier!,
  });

  const { organizations } = org_record?.data || {};

  const record_details = {
    ...data,
    full_name:
      `${data?.first_name || ''} ${data?.middle_name || ''} ${data?.last_name || ''}`.trim() ||
      'None',
    phone,
    email,
    organization: organizations?.length
      ? organizations
          .sort(
            (
              a: {
                label: string;
              },
              b: {
                label: string;
              },
            ) => a.label.localeCompare(b.label),
          )
          .map(({ label }: { label: string }) => label)
          .join(', ')
      : 'None',
  };

  const refetchAll = async () => {
    await refetchPhoneAndEmail();
    await refetchContactDetails();
  };

  useRefetchRecord({
    refetch: refetchAll,
    form_key,
  });

  useRefetchRecord({
    refetch: refetchOrg,
    form_key: 'organization_details',
  });
  if (_error) {
    return <div>Error: {_error.message}</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if(isCollapseRecordSummary) return null

  if(recordState?.config?.showRecordSummary === false) return null

  return (
    <Card
      className='![overflow:unset]'
    >
      <div className='flex flex-col gap-1 p-3' data-test-id={testIDFormatter('rcrd-sum-details-container')}>
          <div>
            <span className="text-md font-medium text-foreground">
              Contact Details
            </span>
          </div>
          <Separator />
        {Object.entries(fields).map(([key, value], index) => {
          const fieldValue = (record_details as { [key: string]: any })?.[value];

          return (
            <div 
              key={key}
              data-test-id={testIDFormatter(`rcrd-sum-details-${value}`)}
            >
              <div className="flex justify-between gap-2 text-sm">
                  <span 
                    className="text-slate-400 whitespace-nowrap"
                    data-test-id={testIDFormatter(`rcrd-sum-details-${value}-label`)}
                  >
                    {key}
                  </span>
                  <span className="break-all text-slate-700" data-test-id={testIDFormatter(`rcrd-sum-details-${value}-value`)}>
                    {fieldValue || 'None'}
                  </span>
              </div>
            </div>
          );
        })}
        {account && account.account_id && (
          <div 
            data-test-id={testIDFormatter('rcrd-sum-details-account')}
          >
            <Separator data-test-id={testIDFormatter('rcrd-sum-details-account-separator')} />
            <div>
              <span
                className="text-sm font-semibold text-foreground"
                data-test-id={testIDFormatter('rcrd-sum-details-account-title')}
              >
                Account Details
              </span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span
                className="text-slate-400 whitespace-nowrap"
                data-test-id={testIDFormatter('rcrd-sum-details-account-role-label')}
              >
                {'Role '}
              </span>
              <span className='break-all text-slate-700' data-test-id={testIDFormatter('rcrd-sum-details-account-role-value')}>
                {account?.role || 'None'}
              </span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span 
                className="text-slate-400 whitespace-nowrap"
                data-test-id={testIDFormatter('rcrd-sum-details-account-email-label')}
              >
                {'Email '}
              </span>
              <span className='break-all text-slate-700' data-test-id={testIDFormatter('rcrd-sum-details-account-email-value')}>
                {account?.account_id || 'None'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecordShellSummary;
