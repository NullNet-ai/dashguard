export interface TimelineItem {
  id: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
    email: string;
    location: string;
  };
  action: {
    type: 'delete' | 'edit' | 'create';
    title: string;
    contactId: string;
    icon: string;
    href: string
    iconColor: string;
    bgColor: string;
  };
  component?: string; // Optional component name for custom rendering
  details?: {
    changes?: Array<{
      field: string;
      oldValue: string;
      newValue: string;
      oldValueColor?: string;
      newValueColor?: string;
    }>;
  };
}