import React from 'react';
import moment from 'moment-timezone';

interface CurrentTimeIndicatorProps {
  isCurrentHour: boolean;
  timezone?: string;
}

const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({
  isCurrentHour,
  timezone = 'Asia/Manila',
}) => {
  if (!isCurrentHour) return null;

  const currentMinute = moment().tz(timezone).minute();
  const hourBlockHeight = 80;
  const minutePosition = (currentMinute / 60) * hourBlockHeight;

  return (
    <div
      className="absolute left-4 right-0 z-10 flex h-0.5 items-center bg-blue-400"
      style={{ top: `${minutePosition}px` }}
    >
      <div className="-ml-1 h-2 w-2 rounded-full bg-blue-500"></div>
    </div>
  );
};

export default CurrentTimeIndicator;