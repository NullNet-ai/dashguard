'use client';

import { useState } from 'react';
import { Checkbox } from '~/components/ui/checkbox';
import { useGrid } from '~/components/platform/Grid/Provider';


const ContactListView = (args: any) => {
  const { state } = useGrid();
  // Function to get avatar color in order
  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-200',
      'bg-green-200',
      'bg-orange-200',
      'bg-purple-200',
      'bg-pink-200',
      'bg-yellow-200',
      'bg-indigo-200',
      'bg-red-200',
    ];

    return colors[index % colors.length];
  };

  // Function to get initials from name or email
  const getInitials = (firstName: string, lastName: string, email?: string) => {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';

    // If we have at least one initial from name, use it
    if (firstInitial || lastInitial) {
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    // If no name initials, use first two characters of email
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }

    return '??';
  };

  return (
    <div className="w-full bg-white p-4">
      {/* Search Bar */}
      {/* <div className="mb-4">
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          Icon={Search}
          iconPlacement="left"
          className="w-full"
        />
      </div>
       */}
      <div className="divide-y divide-gray-200">
        {state?.table.getRowModel().rows.map((row, index) => {
          const origData = row.original;
          return (
            <div
              key={origData.id}
              className="flex items-center gap-3 p-4 transition-colors duration-150 hover:bg-gray-50"
            >
              {/* Checkbox */}
              <Checkbox className="flex-shrink-0" />

              {/* Avatar */}
              <div
                className={`h-10 w-10 rounded-full ${getAvatarColor(index)} flex flex-shrink-0 items-center justify-center`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {getInitials(
                    origData.first_name,
                    origData.last_name,
                    origData.email,
                  )}
                </span>
              </div>

              {/* Contact Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">
                  {origData.first_name} {origData.last_name}
                </div>
                <div className="truncate text-sm text-gray-500">
                  {origData.email}
                </div>
                <div className="text-sm text-gray-500">
                  {origData.formatted_raw_phone_number}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactListView;
