'use client'

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import UserInfo from './user-info';
import { type TimelineItem } from '../types';
import DefaultComponent from './default-component';
import ActionIcon from './action-icon';
import Link from 'next/link';
import { singular } from 'pluralize';
import { formatTextUnderScoreToSpace } from './util/formatter';
import { capitalize, isArray, isEmpty } from 'lodash';
import { validateObjectKeys } from './util/checkItems';
import { gotoWizardRecord } from '~/app/portal/timeline/grid/action/timeline-action';
import { useRouter } from 'next/navigation'
import GridFilterComponent from './grid-filter-component';

const excludedKeysForInsert = [
  'version', 'updated_time', 'updated_by', 'timestamp', 'created_time', 'deleted_by', 'tombstone',
  'requested_by','organization_id', 'previous_status', 'created_date', 'created_by', 'contact_id', 'iso_code', 'id', 'code'
]

const excludedKeys = [
 'version', 'updated_time', 'updated_by', 'timestamp', 'created_time', 'deleted_by', 'tombstone', 'created_date', 
]


interface TimelineItemProps {
  item: any;
  toggleExpanded: (id: string) => void;
  expandedItems: Set<string>;
  showHeader?: boolean;
  size?: 'lg' | 'sm';
  components?: any[];
}

// Component registry for dynamic component rendering
const componentRegistry: Record<
  string,
  React.ComponentType<{
    item: any;
    toggleExpanded: (id: string) => void;
    expandedItems: Set<string>;
    showHeader?: boolean;
  }>
> = {
  default: DefaultComponent,
  grid_filter: GridFilterComponent,
};

const TimelineItemComponent: React.FC<TimelineItemProps> = ({
  item,
  toggleExpanded,
  expandedItems,
  showHeader,
  size = 'lg',
  components = [],
}) => {
  
  item.component = 'default';
  switch (item?.table) {
    case 'grid_filters':
      item.component = 'grid_filter';
      break;
    case 'files':
      item.component = 'file';
      break;
    case 'contact_emails':
    case 'contact_phone_numbers':
      item.component = 'phone_email';
      break;
    case 'organization_contacts':
    case 'contact_organizations':
    case 'organizations':
      item.component = 'organization';
      break;
    default:
      item.component = 'default';
      break;

  }


  const isExist = validateObjectKeys(item?.old_value, item.action);
  const router = useRouter();

  if (isExist) return null; 

  const renderCustomComponent = (item: any) => {
    // If component is specified and exists in registry, use it
    if (item.component && components?.length) {
      const CustomComponent = components.find((component) => component.id === item.component)?.component;
      if (CustomComponent) {
        return (
          <CustomComponent
            item={item}
            toggleExpanded={toggleExpanded}
            expandedItems={expandedItems}
            showHeader={showHeader}
          />
        );
      }
    }

    return <DefaultComponent item={item} toggleExpanded={toggleExpanded} expandedItems={expandedItems} showHeader={showHeader} />
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline Icon */}
      <ActionIcon
        showHeader={showHeader ?? true}
        action={item.action}
        values={{
          new_value: item.new_value,
          old_value: item.old_value,
        }}
      />

      {/* Timeline Left Side - User Info */}
      <UserInfo item={item} time={item.record_updated_time} showHeader={showHeader} />

      {/* Timeline Right Side - Action */}
      <div className={`flex-1 class-size-${size} ${size === 'sm' ? 'max-w-full' : ' lg:max-w-[40%]'}`}>
        <div className="p-4 py-3">{renderCustomComponent(item)}</div>
      </div>
    </div>
  );
};

export default TimelineItemComponent;
