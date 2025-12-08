'use client';

import TimelineControl from '~/components/ui/timeline';

interface TimelineComponentProps {
  date: string;
  states: any;
  showGridFilterIsCurrent?: boolean;
}

const DefaultTimelineComponent = ({
  date,
  states,
  showGridFilterIsCurrent = false,
}: TimelineComponentProps) => {
  return (
    <TimelineControl
      date={date}
      states={states}
      showGridFilterIsCurrent={showGridFilterIsCurrent}
      size={'lg'}
    />
  );
};

export default DefaultTimelineComponent;
