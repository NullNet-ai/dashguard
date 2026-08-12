'use client';

import { useState } from 'react';
import TimelineHeader from './_components/timeline-header';
import TimelineItemComponent from './_components/timeline-item';
import moment from 'moment';
import { type TimelineItem } from './types';
import { dummyData } from '~/app/portal/timeline/_components/timeline-data';
import { groupByDate } from './_components/util/group-by-date';
import { isEmpty } from 'lodash';
import { cn } from '~/lib/utils';

interface TimelineControlProps {
  date: string;
  states: any;
  showGridFilterIsCurrent?: boolean;
  size?: 'lg' | 'sm';
  components?:any[];
}

export default function TimelineControl({
  date,
  states,
  showGridFilterIsCurrent = false,
  size = 'lg',
  components = [],
}: TimelineControlProps) {

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const {
    metadata: { application } = {},
  } = states?.config ?? {};

  const _data = states?.infinite_options?.infiniteData || [];
  
  const rawData = _data.length ? _data : states?.data?.length ? states.data : dummyData;
  
  //show only current changes
  const filteredData = !showGridFilterIsCurrent
    ? rawData?.filter((item: any) => {
        if (
          !isEmpty(item?.new_value?.is_current) &&
          !isEmpty(item?.old_value?.is_current)
        ) {
          return false;
        }
        return true;
      })
    : rawData;

  const groupData = groupByDate(filteredData);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="mb-8">
      {groupData?.length > 0 ? (
        groupData.map((group, index) => {
          return (
            <div className="mt-4" key={group.date + index}>
              {/* Header */}
              <TimelineHeader date={moment(group.date).format('MMMM Do YYYY')} />

              {/* Timeline */}
              <div className="relative px-4">
                {/* Vertical Timeline Line */}
                <div className={cn(`absolute bottom-0 left-[17rem] top-0 w-px border-l border-dashed`,
                  { 'left-[21rem]': application !== 'record' }
                )}></div>
                <div className="space-y-6">
                  {group?.data?.map((item) => (
                    // <div>{item.id}</div>
                    <TimelineItemComponent
                      key={item.id}
                      item={item}
                      toggleExpanded={toggleExpanded}
                      expandedItems={expandedItems}
                      showHeader={application !== 'record'}
                      size={size}
                      components={components}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              There are no timeline events to display for the selected period. Timeline data will appear here when available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
