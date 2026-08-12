'use client';

import TimelineControl from '~/components/ui/timeline';
import {
  DefaultComponent,
  GridFilterComponent,
  FileComponent,
  OrganizationComponent,
  PhoneEmailComponent,
} from '../../timeline-components/';

interface TimelineComponentProps {
  date: string;
  states: any;
  showGridFilterIsCurrent?: boolean;
  components: any[];
}

const components = [
  {
    id: 'default',
    component: DefaultComponent,
  },
  {
    id: 'grid_filter',
    component: GridFilterComponent,
  },
  {
    id: 'file',
    component: FileComponent,
  },
  {
    id: 'organization',
    component: OrganizationComponent,
  },
  {
    id: 'phone_email',
    component: PhoneEmailComponent,
  },
];

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
      size={'sm'}
      components={components}
    />
  );
};

export default DefaultTimelineComponent;
