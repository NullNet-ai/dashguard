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

    const {
        error: _error,
      } = api.contact.fetchContactPhoneEmail.useQuery({
        code: identifier!,
        pluck_fields: ['id'],
      });

      const { isCollapseRecordSummary } =
      useContext(RecordWrapperContext);

      const {
        data,
        refetch: refetchContactDetails,
        error,
      } = api.contact.getContactWithAddress.useQuery({
        code: identifier!,
        pluck_fields: [
          'id',
          'categories'
        ],
      });

      const categories = data?.categories || [];

      const record_details = {
        ...data,
        categories: categories.length ? categories : null
      };

      const refetchAll = async () => {
        await refetchContactDetails();
      };

      useRefetchRecord({
        refetch: refetchAll,
        form_key,
      });

      if (_error) {
        return <div>Error: {_error.message}</div>;
      }
      if (error) {
        return <div>Error: {error.message}</div>;
      }
    if(isCollapseRecordSummary) return null

    if (!record_details.categories) return null;

    return (
      <div data-test-id={testIDFormatter('rcrd-sum-details-categories')}>
        <div className="inline-flex gap-2 text-sm flex-wrap">
          {record_details.categories.map((category: string) => (
            <Badge
              variant={'primary'}
              className=""
              key={category}
              data-test-id={testIDFormatter(`rcrd-sum-details-category-${category}`)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    );
}

export default RecordContactBadge;