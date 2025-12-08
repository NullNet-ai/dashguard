import { Sparkle } from 'lucide-react';
import { EventType, GroupedEvent } from '~/components/ui/calendar/_components/views/_common/types';
import { getEventLineColor } from '~/components/ui/calendar/_components/views/_common/utils';
import { cn } from '~/lib/utils';


interface Props {
  event: EventType;
  hourIndex: number;
  calenderType?: 'timeline' | 'calendar';
  allEventsInTimeline?: GroupedEvent[]; // Add this for consistency
}

const AddTranpoEvent = ({ event, hourIndex, calenderType, allEventsInTimeline = [] }: Props) => {

  const borderType =
  event?.metadata?.lineType === 'solid' ? 'border-solid' : 'border-dashed';

  return (
    <>
      <div className="mb-4 pl-6 last:mb-0">
        <div
          className={cn(
            'absolute left-[-10px] h-full w-0.5 border-l-2',
            `${borderType}`,
            `${getEventLineColor(event?.metadata?.lineColor)}`,
            hourIndex === 0 ? 'top-0' : '-',
            // isLastHour && isLastDate ? "h-16" : "h-[70px]"
          )}
        />
        <button
          onClick={() => {
            alert(`EVENT: ${JSON.stringify(event)}` );
          }}
          className="flex max-w-[200px] items-center justify-center space-x-2 rounded-lg bg-gradient-to-b from-blue-500 to-purple-500 px-4 py-2 text-sm text-white transition-colors duration-200 hover:from-blue-600 hover:to-purple-600"
        >
          <Sparkle className="size-4" />
          <span>Add Transportation</span>
        </button>
      </div>
    </>
  );
};

AddTranpoEvent.displayName = 'AddTranpoEvent';

export default AddTranpoEvent;
