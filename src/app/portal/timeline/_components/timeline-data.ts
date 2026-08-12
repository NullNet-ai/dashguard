import { type TimelineItem } from '~/components/ui/timeline/types';


export const dummyData: TimelineItem[] = [
  {
    id: '1',
    timestamp: '08:35 AM',
    user: {
      name: 'John Smith',
      role: 'Manager',
      email: 'John_Smith456@example.com',
      location: 'San Jose, CA',
    },
    action: {
      type: 'delete',
      title: 'Contact',
      contactId: 'CO10001',
      href: '/portal/contact/record/CO001033/contact',
      icon: 'Trash2',
      iconColor: 'text-white',
      bgColor: 'bg-red-500',
    },
    component: 'default',
    details: {
      changes: [
        {
          field: 'Status',
          oldValue: 'Active',
          newValue: 'Deleted',
          oldValueColor: 'text-green-600',
          newValueColor: 'text-red-600',
        },
        {
          field: 'Last Modified',
          oldValue: '2024-05-24',
          newValue: '2024-05-25',
        },
      ],
    },
  },
  {
    id: '2',
    timestamp: '08:00 AM',
    user: {
      name: 'John Smith',
      role: 'Manager',
      email: 'John_Smith456@example.com',
      location: 'San Jose, CA',
    },
    action: {
      type: 'edit',
      title: 'Contact',
      contactId: 'CO10001',
      href: '/portal/contact/record/CO001033/contact',
      icon: 'User',
      iconColor: 'text-white',
      bgColor: 'bg-orange-500',
    },
    // No component specified - will use fallback rendering
  },
  {
    id: '3',
    timestamp: '08:30 AM',
    user: {
      name: 'John Smith',
      role: 'Manager',
      email: 'John_Smith456@example.com',
      location: 'San Jose, CA',
    },
    action: {
      type: 'edit',
      title: 'Contact',
      contactId: 'CO10001',
      href: '/portal/contact/record/CO001033/contact',
      icon: 'Edit',
      iconColor: 'text-white',
      bgColor: 'bg-orange-500',
    },
    component: 'default',
    details: {
      changes: [
        {
          field: 'State',
          oldValue: 'Draft',
          newValue: 'Active',
          oldValueColor: 'text-red-500',
          newValueColor: 'text-green-500',
        },
      ],
    },
  },
  {
    id: '4',
    timestamp: '08:18 AM',
    user: {
      name: 'John Smith',
      role: 'Manager',
      email: 'John_Smith456@example.com',
      location: 'San Jose, CA',
    },
    action: {
      type: 'edit',
      title: 'Contact',
      contactId: 'CO10001',
      href: '/portal/contact/record/CO001033/contact',
      icon: 'Settings',
      iconColor: 'text-white',
      bgColor: 'bg-orange-500',
    },
    details: {
      changes: [
        {
          field: 'First Name',
          oldValue: 'Gerard',
          newValue: 'Dominique',
          oldValueColor: 'text-red-500',
          newValueColor: 'text-green-500',
        },
      ],
    },
  },
  {
    id: '5',
    timestamp: '08:00 AM',
    user: {
      name: 'John Smith',
      role: 'Manager',
      email: 'John_Smith456@example.com',
      location: 'San Jose, CA',
    },
    action: {
      type: 'create',
      title: 'Contact',
      contactId: 'CO10001',
      icon: 'Plus',
      href: '/portal/contact/record/CO001033/contact',
      iconColor: 'text-white',
      bgColor: 'bg-green-500',
    },
  },
];