'use client';
import React, { useEffect } from 'react';
import { closestCorners } from '@dnd-kit/core';

import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "~/components/ui/sortable";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { GripVerticalIcon } from 'lucide-react';

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
          <div className="flex w-full max-w-[200px] flex-col bg-gray-100 min-h-[200px] md:min-h-[300px]  pb-4">
            {fields?.map((field) => (
              <>
                <SortableItem key={field.id} value={field.id} asChild 
                >
                  <div
                    className={cn(
                      `${selected?.id === field?.id ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"}`,
                      "border-b-default-100 flex flex-row items-center gap-2 border-b py-2",
                      "cursor-pointer bg-white",
                    )}
                    
                    onClick={() => {
                       if(!disabled) {
                        onTabSelect?.(field);
                       }
                        
                    }}
                  >
                    <SortableDragHandle
                      disabled={disabled}
                      variant="link"
                      size="icon"
                      className='size-8 shrink-0 text-default/40'
                    >
                      <GripVerticalIcon className={cn(`${disabled ? 'opacity-0 w-0 h-0' : 'size-5'}`, '')} aria-hidden="true" />
                    </SortableDragHandle>
                    <div className="min-w-[150px]">
                      <span
                        className={cn(
                          `${field.id === selected?.id ? "text-primary font-semibold" : ""}`,
                        )}
                      >
                        {field.name}
                      </span>
                    </div>
                  </div>
                </SortableItem>
              </>
            ))}
            <div className="mt-2 flex justify-center">
              <Button
                disabled={disabled}
                className="w-[80%] border-2 border-dashed border-primary text-md text-primary"
                variant={'ghost'}
                onClick={() => {
                  onClickAddTab?.();
                }}
              >
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
