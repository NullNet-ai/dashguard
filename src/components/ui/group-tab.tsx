'use client';
import React, { useEffect } from 'react';
import { closestCorners } from '@dnd-kit/core';

import {
  Sortable,
} from '~/components/ui/sortable';
import { Button } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';


export type GroupTabType = {
  id: string;
  name: string;
  content: React.ReactNode | string;
} & Record<string, any>;

export interface GroupTabProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: GroupTabType | null;
  fields: any[];
  onValueChange?: (value: GroupTabType[]) => void;
  onTabSelect?: (tab: GroupTabType) => void;
  onClickAddTab?: () => void;
  disabled?: boolean;
  render?: (arg: any, index: number) => any;
  renderContent?: (arg: any, index: number) => any;
  move: any
  replace: any
}

const GroupTab = React.forwardRef<HTMLDivElement, GroupTabProps>(
  ({
    selected,
    fields,
    onValueChange,
    onTabSelect,
    onClickAddTab,
    disabled,
    move,
    render,
    renderContent,
    replace,
    ...props
  }, ref) => {
    const handleMove = ({ activeIndex, overIndex }: { activeIndex: number; overIndex: number }) => {
        move(activeIndex, overIndex);        
    };

    useEffect(() => {
      if (fields.some((field, index) => field.order !== index + 1)) {
        const newFields = fields.map((field, index) => {
          return {
            ...field,
            order: index + 1,
          };
        });
        replace(newFields);
      }
    }, [fields]);

    return (
      <div className="flex gap-x-2 p-4 text-md" ref={ref}>
        <Sortable
          value={fields}
          collisionDetection={closestCorners}
          onValueChange={onValueChange}
          orientation="vertical"
          onMove={handleMove}
        >
          <div className="flex min-h-[200px] w-full max-w-[200px] flex-col bg-gray-100 pb-4 md:min-h-[300px]">
            {fields.map((field, index) => (
              <>{render?.(field, index)}</>
            ))}
            <div className="mt-2 flex justify-center">
              <Button
                disabled={disabled}
                className="w-[80%] border-2 border-dashed border-primary text-md text-primary flex items-center justify-center gap-x-2"
                variant={'ghost'}
                onClick={() => {
                  onClickAddTab?.();
                }}
              >
                <PlusIcon className='size-4'/>
                Add new Attribute
              </Button>
            </div>
          </div>
        </Sortable>
        {
          fields?.map((field, index) => {
            return renderContent?.(field, index)
          })
        }
      </div>
    );
  },
);

GroupTab.displayName = 'GroupTab';

export default GroupTab;
