'use client';

import { Separator } from '~/components/ui/separator';
import IdentifierComponent from './Header/IdentifierComponent';
import ProfileImage from './Header/ProfileImage';
import SummaryRecordTab from './Header/SummaryTab';
import SystemDates from './Header/SystemDate';
import { RecordWrapperContext } from '../providers/RecordWrapperProvider';
import { useContext } from 'react';
import {  ChevronRightIcon } from 'lucide-react';
import { Button } from '@headlessui/react';

const SummaryClientContent = ({ recordDetails, mainEntity, token }: any) => {
  const { isCollapseRecordSummary, onClickCollapseButton } =
    useContext(RecordWrapperContext);

  const handleClickCollapseButton = () => onClickCollapseButton?.();


  return (
    <div>
      {isCollapseRecordSummary ? (
        <div className="flex h-[calc(100%+20px)] flex-col items-center justify-center pt-2">
          <div className='flex flex-row items-center justify-center'>
            <Button
              className="flex size-5 items-center justify-center rounded-full bg-primary/10"
              onClick={handleClickCollapseButton}
            >
              <ChevronRightIcon
                className={`} hidden h-4 w-4 cursor-pointer text-primary transition-transform md:block`}
              />
            </Button>
          </div>
          <span className="vertical-text mt-1 rotate-180 py-2 text-xs font-semibold text-gray-600 [writing-mode:vertical-lr]">
            Record Summary
          </span>
        </div>
      ) : (
        <>
          <IdentifierComponent
            code={recordDetails?.data?.code!}
            status={recordDetails?.data?.status!}
          />
          <SummaryRecordTab />
          <ProfileImage
            details={recordDetails}
            entity={mainEntity}
            token={token}
          />
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
          />
          <Separator />
        </>
      )}
      {/* <Separator /> */}
      {}
    </div>
  );
};
export default SummaryClientContent;
