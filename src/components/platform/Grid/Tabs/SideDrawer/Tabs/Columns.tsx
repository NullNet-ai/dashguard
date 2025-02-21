import { useMemo, useState } from 'react';
import { GripVerticalIcon,  Search } from 'lucide-react';
import { Switch } from '~/components/ui/switch';
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from '~/components/ui/sortable';
import { useFieldArray, useForm } from 'react-hook-form';


export default function ColumnContent() {
  const form = useForm({
    defaultValues: {
      columns: [
        {
          id: '1',
          label: 'ID',
          value: true,
          icon: '≡',
          order: 0,
        },
        {
          id: '2',
          label: 'Name',
          value: true,
          icon: '≡',
          order: 1,
        },
        {
          id: '3',
          label: 'Status',
          value: true,
          icon: '≡',
          order: 2,
        },
        {
          id: '4',
          label: 'Created Date',
          value: false,
          icon: '≡',
          order: 3,
        },
        {
          id: '5',
          label: 'Modified Date',
          value: false,
          icon: '≡',
          order: 4,
        },
        {
          id: '6',
          label: 'Description',
          value: false,
          icon: '≡',
          order: 5,
        },
      ],
    },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { fields, move, update } = useFieldArray({
    control: form.control,
    name: 'columns',
  });

  const filteredColumns = useMemo(() => {
    return fields.filter((column) =>
      column.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [fields, searchQuery]);

  const handleToggle = (index: number, id: string) => {
    update(index, {
      ...(fields?.find((column) => column.id === id) ?? {
        value: false,
        icon: '≡',
        order: 0,
        label: '',
        id: '',
      }),
      value: !fields?.find((column) => column.id === id)?.value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative my-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search columns..."
          className="w-full rounded-md border py-2 pl-8 pr-4 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Sortable
        value={filteredColumns}
        onMove={({ activeIndex, overIndex }) => {
          move(activeIndex, overIndex);
        }}
      >
        {filteredColumns.map((column, index) => (
          <SortableItem value={column.id} key={column.id} id={column.id}>
            <div className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <SortableDragHandle
                  variant="ghost"
                  size="icon"
                  className="mb-1 size-4 shrink-0 text-muted-foreground"
                >
                  <GripVerticalIcon className="size-6" aria-hidden="true" />
                </SortableDragHandle>
                <span className="text-sm text-muted-foreground">
                  {column.label}
                </span>
              </div>
              <Switch
                size="sm"
                checked={column.value}
                onCheckedChange={() => handleToggle(index, column.id)}
              />
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </div>
  );
}
