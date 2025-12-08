'use client';

import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

import useRefetchRecord from '../hooks/useFetchMainRecord';
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import { Fragment, useContext } from 'react';
import { CardComponent as Card } from '~/components/ui/card/index';

const statuses = {
  Active: 'text-green-600 bg-green-400/10',
  Invited: 'text-yellow-600 bg-yellow-400/10',
  'Pending Setup': 'text-yellow-500 bg-yellow-400/10',
  'Invitation Canceled': 'text-red-600 bg-red-400/10',
  'Invitation Expired': 'text-orange-600 bg-orange-400/10',
  'Access Disabled': 'text-red-600 bg-red-400/10',
  Deactivated: 'text-gray-600 bg-gray-400/10',
};

const RecordShellSummary = ({
  form_key,
  identifier,
}: {
  form_key: string;
  identifier: string;
  main_entity: string;
}) => {

  const { isCollapseRecordSummary } =
  useContext(RecordWrapperContext);

  const {
    data: record = { data: { id: null } },
    refetch,
    error: _error,
  } = api.account.fetchExternalInternalUserDetails.useQuery({
    code: identifier!,
  });

  useRefetchRecord({
    refetch,
    form_key,
  });

  if(isCollapseRecordSummary) return null

  return (
    <Fragment>
      <Card className="p-3">
        <div className="flex flex-col gap-y-2">
          <div>
            <span className="text-md font-medium text-foreground">
              Account Details
            </span>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <div className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-400 whitespace-nowrap">{'Role: '}</span>
                <span className='break-all text-slate-700'>{record?.role || 'None'}</span>
              </div>
            </div>
            <div className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-400 whitespace-nowrap">{'Email: '}</span>
                <span className='break-all text-slate-700'>
                  {record?.account?.email || 'None'}
                </span>
              </div>
            </div>
            {record?.external_contact?.first_name &&
              record?.account?.categories?.[0] === 'External User' && (
                <div className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400 whitespace-nowrap">{'First Name: '}</span>
                    <span className='break-all text-slate-700'>{record?.external_contact?.first_name || 'None'}</span>
                  </div>
                </div>
              )}
            {record?.external_contact?.last_name &&
              record?.categories?.[0] === 'External User' && (
                <div className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400 whitespace-nowrap">{'Last Name: '}</span>
                    <span className='break-all text-slate-700'>{record?.external_contact?.last_name || 'None'}</span>
                  </div>
                </div>
              )}
            <div className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-400 whitespace-nowrap">{'Status: '}</span>
                <div
                  className={cn(
                    'bg-primary/10 text-primary break-all',
                    // @ts-expect-error - TS doesn't know about statuses
                    statuses?.[record?.account?.account_organization_status],
                    'inline-flex items-center rounded-md px-2 text-xs font-normal',
                  )}
                >
                  {record?.account?.account_organization_status || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {record?.account?.categories?.[0] === 'Internal User' && (
        <Card className="p-3">
          <div className="flex flex-col gap-y-2">
            <div>
              <span className="text-md font-medium text-foreground">
                Contact Details
              </span>
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
              <div className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 whitespace-nowrap">{'Primary Phone Number: '}</span>
                  <span className='break-all text-slate-700'>{record?.contact?.phone || 'None'}</span>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 whitespace-nowrap">{'Primary Email: '}</span>
                  <span className='break-all text-slate-700'>
                    {record?.contact?.email || record?.account_email || 'None'}
                  </span>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 whitespace-nowrap">{'First Name: '}</span>
                  <span className='break-all text-slate-700'>{record?.contact?.first_name || 'None'}</span>
                </div>
              </div>
              <div className="text-sm whitespace-nowrap">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">{'Last Name: '}</span>
                  <span className='break-all text-slate-700'>{record?.contact?.last_name || 'None'}</span>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 whitespace-nowrap">{'Middle Name: '}</span>
                  <span className='break-all text-slate-700'>{record?.contact?.middle_name || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </Fragment>
  );
};

export default RecordShellSummary;
