'use client';

import IdentifierComponent from './Header/IdentifierComponent';
import ProfileImage from './Header/ProfileImage';
import SummaryRecordTab from './Header/SummaryTab';
import SystemDates from './Header/SystemDate';
import { RecordWrapperContext } from '../providers/RecordWrapperProvider';
import { useContext } from 'react';
import { ChevronRightIcon } from 'lucide-react';
import { Button } from '@headlessui/react';
import { testIDFormatter } from '~/utils/formatter';
import { CardComponent as Card } from '~/components/ui/card/index';
import capitalize from 'lodash/capitalize';
import { Badge } from '~/components/ui/badge';
import { RecordContext, useRecord } from '../Provider';
import { cn } from '~/lib/utils';

const SummaryClientContent = ({
  recordDetails,
  mainEntity,
  token,
  image_placeholder,
  header_center_slot,
  is_show_header_tab = false,
  actions,
  children,
}: any) => {
  const { isCollapseRecordSummary, onClickCollapseButton } =
    useContext(RecordWrapperContext);

  const { state: recordState } = useRecord() ?? {};

  const { state } = useContext(RecordContext);
  const entityName = state?.entityName;

  const status = recordDetails?.data?.status!;

  const handleClickCollapseButton = () => onClickCollapseButton?.();

  const collapseBtn = (
    <Button
      className={cn(
        'absolute -right-2 bottom-0 flex size-6 w-fit items-center justify-center rounded-full border bg-background p-1 shadow',
        !isCollapseRecordSummary ? 'top-0 my-auto' : 'top-[10px] my-0',
      )}
      onClick={handleClickCollapseButton}
      data-test-id={testIDFormatter('rcrd-sum-collapse-button')}
    >
      <ChevronRightIcon
        className={cn(
          'size-4 transition-transform duration-200',
          !isCollapseRecordSummary ? 'rotate-180' : 'rotate-0',
        )}
        data-test-id={testIDFormatter('rcrd-sum-collapse-icon')}
      />
    </Button>
  );

  return (
    <div data-test-id={testIDFormatter('rcrd-sum-container')}>
      {isCollapseRecordSummary ? (
        <div className="group relative">
          <Card>
            <div
              className="flex h-[calc(100dvh-100px)] flex-col items-center pt-2"
              data-test-id={testIDFormatter('rcrd-sum-collapsed')}
            >
              <span
                className="vertical-text mt-1 rotate-180 py-2 text-md font-semibold text-black [writing-mode:vertical-lr]"
                data-test-id={testIDFormatter('rcrd-sum-collapsed-label')}
              >
                Record Summary
              </span>
            </div>
          </Card>
          <div className="hidden group-hover:block">{collapseBtn}</div>
        </div>
      ) : (
        <div
          className={cn(
            `flex flex-col`,
            `${recordState?.config?.showToolbar === false ? '' : 'gap-2'}`,
          )}
        >
          {is_show_header_tab && (
            <div className="group relative">
              <Card>
                <IdentifierComponent
                  code={recordDetails?.data?.code!}
                  status={recordDetails?.data?.status!}
                  actions={actions}
                  data-test-id={testIDFormatter('rcrd-sum-identifier')}
                />
              </Card>
              <div className="hidden group-hover:block">{collapseBtn}</div>
            </div>
          )}
          <Card>
            <div className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-x-1">
                  <span
                    data-test-id={entityName + '-rcrd-code'}
                    className="me-2 text-md font-medium"
                  >
                    {recordDetails?.data?.code}
                  </span>
                </div>
                {header_center_slot}
                <Badge
                  variant={status === 'Archived' ? 'secondary' : 'success'}
                  data-test-id={entityName + '-rcrd-status'}
                >
                  {capitalize(status)}
                </Badge>
              </div>
              <ProfileImage
                image_placeholder={image_placeholder}
                details={recordDetails}
                entity={mainEntity}
                token={token}
                data-test-id={testIDFormatter('rcrd-sum-profile-image')}
              />
              {children}
              <SystemDates
                created_date={recordDetails?.data?.created_date!}
                created_time={recordDetails?.data?.created_time!}
                updated_date={recordDetails?.data?.updated_date!}
                updated_time={recordDetails?.data?.updated_time!}
                created_by_first_name={
                  recordDetails?.data?.created_by_data?.first_name || ''
                }
                created_by_last_name={
                  recordDetails?.data?.created_by_data?.last_name || ''
                }
                updated_by_first_name={
                  recordDetails?.data?.updated_by_data?.first_name || ''
                }
                updated_by_last_name={
                  recordDetails?.data?.updated_by_data?.last_name || ''
                }
                data-test-id={testIDFormatter('rcrd-sum-system-dates')}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
export default SummaryClientContent;
