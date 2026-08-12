'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '~/lib/utils';
import { TimelineItem } from '~/components/ui/timeline/types';
import Link from 'next/link';

interface DefaultComponentProps {
  item: TimelineItem;
  toggleExpanded: (id: string) => void;
  expandedItems: Set<string>;
}

const DefaultComponent = ({
  item,
  toggleExpanded,
  expandedItems,
}: DefaultComponentProps) => {
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {item.action.title}
        </span>
        <Link href={item.action?.href} className="cursor-pointer text-sm text-blue-500 underline">
          ({item.action.contactId})
        </Link>
      </div>

      {/* Expandable Details */}
      {item.details && (
        <>
          <div className="mt-3">
            {item.details.changes?.map((change, changeIndex) => (
              <div key={changeIndex} className="flex gap-2 text-sm mb-2">
                <div className="flex-1 rounded-md bg-slate-200 p-2">
                  <div className="text-gray-600">{change.field}</div>
                  <div
                  className={cn(`font-medium line-through`, 'text-danger',
                  )}
                  >
                    {change.oldValue}
                  </div>
                </div>
                <div className="flex-1 rounded-md bg-slate-200 p-2">
                  <div className="text-gray-600">{change.field}</div>
                  <div
                    className={`font-medium text-success`}
                  >
                    {change.newValue}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => toggleExpanded(item.id)}
            className="mt-3 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
          >
            <span>view more</span>
            {expandedItems.has(item.id) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedItems.has(item.id) && (
            <div className="mt-3 rounded border bg-white p-3 text-sm">
              <p className="text-gray-600">
                Additional details would appear here...
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

DefaultComponent.displayName = 'DefaultComponent';

export default DefaultComponent;
