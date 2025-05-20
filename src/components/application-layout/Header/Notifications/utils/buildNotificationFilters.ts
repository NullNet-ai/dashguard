import { type TNotificationType } from '../types';

export const buildNotificationFilters = ({
  type,
  showRead,
}: {
  type: TNotificationType;
  showRead: boolean;
}) => {
  const filters = [];

  switch (type) {
    case 'all':
      filters.push({
        type: 'criteria',
        field: 'status',
        operator: 'equal',
        values: ['Active'],
      });
      break;
    case 'pinned':
      filters.push({
        type: 'criteria',
        field: 'status',
        operator: 'equal',
        values: ['Active'],
      });
      filters.push({
        operator: 'and',
        type: 'operator',
        default: true,
      });
      filters.push({
        type: 'criteria',
        field: 'is_pinned',
        operator: 'equal',
        values: [true],
      });
      break;
    case 'system':
      filters.push({
        type: 'criteria',
        field: 'status',
        operator: 'equal',
        values: ['Active'],
      });
      filters.push({
        operator: 'and',
        type: 'operator',
        default: true,
      });
      filters.push({
        type: 'criteria',
        field: 'categories',
        operator: 'contains',
        values: ['System'],
      });
      break;
    case 'social':
      filters.push({
        type: 'criteria',
        field: 'status',
        operator: 'equal',
        values: ['Active'],
      });
      filters.push({
        operator: 'and',
        type: 'operator',
        default: true,
      });
      filters.push({
        type: 'criteria',
        field: 'categories',
        operator: 'contains',
        values: ['Social'],
      });
      break;
    case 'archive':
      filters.push({
        type: 'criteria',
        field: 'status',
        operator: 'equal',
        values: ['Archived'],
      });
      break;
  }

  if (filters.length > 0 && showRead) {
    filters.push(
      {
        operator: 'and',
        type: 'operator',
        default: true,
      },
      {
        type: 'criteria',
        field: 'notification_status',
        operator: 'equal',
        values: ['unread'],
      },
    );
  }

  return filters;
};
