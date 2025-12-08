import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import moment from 'moment-timezone';
import { type TimelineItem } from '../types';
import { cn } from '~/lib/utils';

interface UserInfoProps {
  item: any;
  time: string;
}

const UserInfo: React.FC<UserInfoProps & { showHeader?: boolean }> = ({ item, time, showHeader = true }) => {
  // Get browser timezone for display
  const getBrowserTimezone = () => {
    return moment.tz.guess();
  };

  const timezone = getBrowserTimezone();  
  
  // Parse time in HH:MM format and format to 12-hour format
  const momentObj = moment(time, 'HH:mm');
  const formattedTime = momentObj.isValid() ? momentObj.format('h:mm A') : time;

  return (
    <div className={cn(`w-[16rem] flex-shrink-0`, { 'w-[20rem] ': showHeader })}>
      <div className="flex flex-row gap-x-4 justify-between">
        <div className="text-sm">
          <div className="text-base font-medium text-default/90">
            {item?.responsible_account_full_name}
          </div>
          <div className="text-gray-500">{item?.responsible_role_name || 'No role'}</div>
          <div className="mt-1 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Mail className="size-4" />
              <span>{item?.responsible_account_id}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <MapPin className="size-4" />
              <span className="cursor-pointer text-blue-500 underline">
                {timezone}
              </span>
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-400 pr-8">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;