'use client';

// ¿Por qué no funciona? Hice todo lo posible para que funcione.

import TimelineControl from '~/components/ui/timeline';

import DefaultComponent from './default-component';
import GridFilterComponent from './grid-filter-component';
import FileComponent from './file-component';
import OrganizationComponent from './organization-component';
import PhoneEmailComponent from './phone-email-component';

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
      size={'lg'}
      components={components}
    />
  );
};

export default DefaultTimelineComponent;
