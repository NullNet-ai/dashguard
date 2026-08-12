'use client'

import { useState } from 'react';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';
import { Search } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  bgColor: string;
}

const ContactList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Angela Kane',
      email: 'Micheal_Kruck90@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'AK',
      bgColor: 'bg-blue-200'
    },
    {
      id: '2',
      name: 'Bailey Parker',
      email: 'bailey.parker@example.com',
      phone: '+1 (555) 987-2310',
      initials: 'BP',
      bgColor: 'bg-green-200'
    },
    {
      id: '3',
      name: 'Blake Young',
      email: 'blake.young@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'BY',
      bgColor: 'bg-orange-200'
    },
    {
      id: '4',
      name: 'Casey Rivers',
      email: 'casey.rivers@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'CR',
      bgColor: 'bg-purple-200'
    },
    {
      id: '5',
      name: 'Devin Ellis',
      email: 'devin.ellis@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'DE',
      bgColor: 'bg-blue-200'
    },
    {
      id: '6',
      name: 'Finley Porter',
      email: 'finley.porter@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'FP',
      bgColor: 'bg-green-200'
    },
    {
      id: '7',
      name: 'Jordan Tate',
      email: 'jordan.tate@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'JT',
      bgColor: 'bg-orange-200'
    },
    {
      id: '8',
      name: 'Kendall Avery',
      email: 'kendall.avery@example.com',
      phone: '+1 (675) 123-5478',
      initials: 'KA',
      bgColor: 'bg-purple-200'
    }
  ];

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <div className="w-full p-4 bg-white">
      {/* Search Bar */}
      <div className="mb-4">
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
      
      <div className="divide-y divide-gray-200">
        {filteredContacts.map((contact, index) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors duration-150"
          >
            {/* Checkbox */}
            <Checkbox className="flex-shrink-0" />
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full ${contact.bgColor} flex items-center justify-center flex-shrink-0`}>
              <span className="text-sm font-medium text-gray-700">
                {contact.initials}
              </span>
            </div>
            
            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {contact.name}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {contact.email}
              </div>
              <div className="text-sm text-gray-500">
                {contact.phone}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList