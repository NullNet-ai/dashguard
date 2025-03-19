'use client';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import {
  Sortable,
  SortableItem,
} from '~/components/ui/sortable';
import GroupAdvFilter from './GroupAdvFilter';
import useFilterContentActions from './customHooks/useFIlterContent';
import { useMemo } from 'react';

export default function FilterContent() {

  const  {
    form,
    filterGroups,
    handleAddFilterGroup,
    handleRemoveFilterGroup,
    handleFilterGroupMove,
    handleUpdateGroupOperator,
    handleAppendFilter,
    handleRemoveFilter,
    handleUpdateJunctionOperator,
  } = useFilterContentActions()

  const { first_group_item,  rest_group_items } = useMemo(() => {
    if (!filterGroups || filterGroups.length === 0) {
      return { first_group_item: null, rest_group_items: [] };
    }
  
    return {
      first_group_item: filterGroups[0],
      rest_group_items: filterGroups.slice(1),
    };
  }, [filterGroups]);

  return (
    <div className="mt-3 max-h-[70vh] space-y-1 overflow-y-auto rounded-lg">
      <Form {...form}>
           <GroupAdvFilter 
              groupIndex={0}
              group={first_group_item as { groupOperator: "and" | "or" }}
              handleUpdateGroupOperator={handleUpdateGroupOperator}
              handleRemoveFilterGroup={handleRemoveFilterGroup}
              handleRemoveFilter={handleRemoveFilter}
              handleUpdateJunctionOperator={handleUpdateJunctionOperator}
              filterGroupLength={filterGroups?.length}
              form={form}
            />
        <Sortable
          value={rest_group_items.map((group) => ({ ...group, id: group.id }))}
          onMove={({ activeIndex, overIndex }) => {
            handleFilterGroupMove(activeIndex, overIndex);
          }}
        >
          {rest_group_items.map((group, idx) => {
            const groupIndex = idx + 1;
            return (
              <SortableItem
                value={group.id}
                key={group.id}
                id={String(groupIndex)}
              >
              <GroupAdvFilter 
                group={group}
                groupIndex={groupIndex}
                handleUpdateGroupOperator={handleUpdateGroupOperator}
                handleRemoveFilterGroup={handleRemoveFilterGroup}
                handleRemoveFilter={handleRemoveFilter}
                handleUpdateJunctionOperator={handleUpdateJunctionOperator}
                filterGroupLength={filterGroups?.length}
                form={form}
              />
              </SortableItem>
            );
          })}
        </Sortable>
      </Form>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleAddFilterGroup}
        className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <Plus className="h-4 w-4" />
        Add Group Filter
      </Button>
    </div>
  );
}
