import React from 'react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { type TimelineItem } from '../types';
import { cn } from '~/lib/utils';

interface ActionIconProps {
  action: 'UPDATE' | 'DELETE' | 'INSERT' | 'ARCHIVE' | 'SOFT DELETE';
  values: {
    new_value: any;
    old_value: any;
  };
}

const ActionIcon: React.FC<ActionIconProps & { showHeader: boolean }> = ({ action, values, showHeader=true }) => {
  const getActionIcon = (values: ActionIconProps['values'], action: ActionIconProps['action']) => {
    const uniqueChildrenKeys = [
      'contact_organization_id'
    ]
    let iconClass = `size-3.5 text-blue-500`;
    let iconBgColor = `bg-blue-200 border-blue-100`;

    // Get the icon component from Lucide icons
    let IconComponent = LucideIcons.PencilIcon;

    const isNewValueHasStatusArchive = values.new_value?.status === 'Archived';

    if(action === 'SOFT DELETE') {
      IconComponent = HeroIcons.TrashIcon;
      iconClass = `size-4 text-red-500`;
      iconBgColor = `bg-red-200 border-red-100`;
    }

    if (action === 'DELETE' || action === 'ARCHIVE' || isNewValueHasStatusArchive ) {
      IconComponent = HeroIcons.ArchiveBoxArrowDownIcon;
      iconClass = `size-4 text-gray-500`;
      iconBgColor = `bg-gray-300`;
    }
    if (action === 'INSERT') {
      IconComponent = LucideIcons.PlusIcon;
      iconClass = `size-3.5 text-green-500 `;
      iconBgColor = `bg-green-200 border-green-100`;
    }

    if (uniqueChildrenKeys.some(key => key in values.new_value) && action === 'INSERT') {
      IconComponent = LucideIcons.PencilIcon;
      iconClass = `size-3.5 text-blue-500 `;
      iconBgColor = `bg-blue-200 border-blue-100`;
    }

    // Check if the icon exists and is a valid React component
    if (
      IconComponent &&
      (typeof IconComponent === 'function' || typeof IconComponent === 'object')
    ) {
      return (
        <div
          className={cn(`absolute left-[16rem] top-2 z-10 flex size-8 -translate-x-1/2 transform items-center justify-center rounded-full ${iconBgColor} border-4   shadow-sm backdrop-blur-sm`, { 'left-[20rem]': showHeader })}
        >
<IconComponent className={iconClass} />
        </div>
      );
    }

    // Fallback to Edit icon if the specified icon doesn't exist
    const FallbackIcon = (LucideIcons as any).Edit;
    return (
      <div
        className={cn(`absolute left-[16rem] top-2 z-10 flex size-8 -translate-x-1/2 transform items-center justify-center rounded-full ${iconBgColor} border-4  shadow-sm backdrop-blur-sm`, { 'left-[20rem]': showHeader })}
      >
        <FallbackIcon className={iconClass} />
      </div>
    );
  };

  return getActionIcon(values, action);
};

export default ActionIcon;
