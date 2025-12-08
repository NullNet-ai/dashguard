import { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react';

const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button 
      {...attributes} 
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
    >
      <GripVertical className="h-4 w-4 text-gray-500" />
    </button>
  )
}

export default RowDragHandleCell;