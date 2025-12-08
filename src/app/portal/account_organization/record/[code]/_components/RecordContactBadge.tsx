'use client'

import { useContext } from 'react';
import { Badge } from '~/components/ui/badge';
import { api } from '~/trpc/react';
import { testIDFormatter } from '~/utils/formatter';
import { usePathname } from 'next/navigation';
import { RecordWrapperContext } from '~/components/platform/Record/providers/RecordWrapperProvider';
import useRefetchRecord from '../_record_summary/hooks/useFetchMainRecord';

const RecordContactBadge = ({form_key}: {form_key: string}) => {

    const pathName = usePathname();
    const [, , , , identifier] = pathName.split("/");

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
      <div data-test-id={testIDFormatter('rcrd-sum-details-categories')}>
        <div className="inline-flex gap-2 text-sm flex-wrap">
          <Badge
            className=""
            key={record?.account?.categories?.[0]}
            variant={'primary'}
          >
            {record?.account?.categories?.[0]}
          </Badge>
        </div>
      </div>
    );
}

export default RecordContactBadge;