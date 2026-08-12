"use client";

import { PencilIcon } from "lucide-react";
import { Edit } from "~/app/portal/organization/grid/Action/Edit";
import { type DefaultRowActions } from "~/components/platform/Grid/types";
import { Button } from "~/components/ui/button";

export default function EditComponent({ row, config }: DefaultRowActions) {
  const handleEdit = async ({ row, config }: DefaultRowActions) => {
    try {
      if (!row.original?.id) return;
      await Edit({
        entity: config?.entity,
        // id: row.original?.id,
        code: row.original?.code,
        status: row.original?.status,
      });
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return;
      console.error('Failed to edit record:', error);
    }
  };

  return (
    <Button
      onClick={() => {
        if (config?.editCustomAction) {
          config?.editCustomAction({ row, config });
          return;
        }
        handleEdit({ row, config });
      }}
      variant={"ghost"}
      className="hover:bg-transparent"
    >
      <PencilIcon className="h-3 w-3 text-primary" />
    </Button>
  );
}
