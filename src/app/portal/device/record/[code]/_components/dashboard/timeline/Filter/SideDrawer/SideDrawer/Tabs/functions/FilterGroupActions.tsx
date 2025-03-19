import React from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

export function FilterGroupActions({
  onAppendFilter,
}: {
  onAppendFilter: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onAppendFilter}
      className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
    >
      <Plus className="h-4 w-4" />
      Add Filter
    </Button>
  );
}