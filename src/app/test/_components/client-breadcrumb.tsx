'use client';

import { useState } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '~/components/ui/breadcrumb';

export default function ClientBreadcrumbExample() {
  const [currentPath, setCurrentPath] = useState<string>('/dashboard/settings');
  
  const pathOptions = [
    '/dashboard',
    '/dashboard/settings',
    '/dashboard/users',
    '/dashboard/users/profile',
  ];
  
  // Custom items for demonstration
  const customItems: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [
      { href: '/dashboard', label: 'Dashboard', isCurrent: true }
    ],
    '/dashboard/settings': [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/settings', label: 'Settings', isCurrent: true }
    ],
    '/dashboard/users': [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/users', label: 'Users', isCurrent: true }
    ],
    '/dashboard/users/profile': [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/users', label: 'Users' },
      { href: '/dashboard/users/profile', label: 'Profile', isCurrent: true }
    ]
  };
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a path to see different breadcrumbs:
        </label>
        <select 
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {pathOptions.map(path => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
      </div>
      
      <Breadcrumb items={customItems[currentPath]} />
    </div>
  );
}