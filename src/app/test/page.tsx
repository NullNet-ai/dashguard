'use client';

import { ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Sortable,
  SortableDragHandle,
  SortableDragHandleRawItem,
  SortableItem,
} from '~/components/ui/sortable';

const Page = () => {
  const [items, setItems] = useState<any>([
    {
      id: '1',
      name: 'Field 1',
      type: 'text',
    },
    {
      id: '2',
      name: 'Field 2',
      type: 'text',
    },
    {
      id: '3',
      name: 'Field 3',
      type: 'text',
    },
    {
      id: '4',
      name: 'Field 4',
      type: 'text',
    },
  ]);

  return (
    <div className="w-full">
      <Sortable
        orientation="horizontal"
        value={items}
        onMove={({ activeIndex, overIndex }) => {
          setItems((items) => {
            const newItems = [...items];
            const [removed] = newItems.splice(activeIndex, 1);
            newItems.splice(overIndex, 0, removed);
            return newItems;
          });
        }}
      >
        <div className="flex w-full flex-row gap-2">
          {items.map((item) => (
            <SortableItem key={item.id} value={item.id}
              className='relative'
            >
              <SortableDragHandleRawItem className="cursor-grab text-muted-foreground flex items-center px-2 py-1">
                <Link
                  href={'#'}
                  className="flex items-center space-x-2 whitespace-nowrap pr-0 text-sm font-medium uppercase text-default-foreground/60 hover:border-t-primary hover:text-primary"
                >
                  {item.name}
                </Link>
                <span className='absolute right-0 h-[50%] w-[1px] bg-default/20'></span>
              </SortableDragHandleRawItem>
              
            </SortableItem>
          ))}
        </div>
      </Sortable>
    </div>
  );
};

export default Page;
