import { MonitorCheck } from 'lucide-react';
import React from 'react';

interface TimelineHeaderProps {
  date: string;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ date }) => {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-sm bg-slate-100 p-2 text-gray-600 sticky top-0 z-[50]">
       <MonitorCheck className='size-5 text-primary'/>
      <span className="font-medium text-md">{date}</span>
    </div>
  );
};

export default TimelineHeader;