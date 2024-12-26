"use client";
import { type DefaultRowActions } from "../types";
import { Edit } from "../Action/Edit";
import { Delete } from "../Action/Delete";
import { Archive } from "../Action/Archived";
import { Restore } from "../Action/Restore";
import { Button } from "@headlessui/react";
import { ArchiveIcon, ArchiveX, ArchiveXIcon, PencilIcon, RotateCcw, TrashIcon } from "lucide-react";

/**
 *
 *
 * @EditComponent
 *
 *
 */

export const handleEdit = async ({ row, config }: DefaultRowActions) => {
  if (!row.original?.id) return;
  await Edit({
    entity: config?.entity,
    // id: row.original?.id,
    code: row.original?.code,
    status: row.original?.status,
  });
};

export function EditComponent({ row, config }: DefaultRowActions) {
  if (config?.editCustomComponent) {
    return <>{config?.editCustomComponent?.({ row, config })}</>;
  }

  return (
    <Button
      onClick={() => {
        if (config?.editCustomAction) {
          config?.editCustomAction({ row, config });
          return;
        }
        handleEdit({ row, config });
      }}
    >
      <PencilIcon className="h-3 w-3 text-primary" />
    </Button>
  );
}

/**
 *
 *
 * @DeleteComponent
 *
 */

const handleDelete = async ({ row, config }: DefaultRowActions) => {
  if (!row.original?.id) return;
  await Delete({ entity: config?.entity, id: row.original?.id });
};

export function DeleteComponent({ row, config }: DefaultRowActions) {
  if (config?.deleteCustomComponent) {
    return <>{config?.deleteCustomComponent({ row, config })}</>;
  }

  return (
    <Button
      onClick={() => {
        if (config?.deleteCustomAction) {
          config?.deleteCustomAction({ row, config });
          return;
        }
        handleDelete({ row, config });
      }}
    >
      <TrashIcon className="h-3 w-3 text-destructive" />
    </Button>
  );
}

/**
 *
 *
 * @ArchiveComponent
 *
 */

export const handleArchive = async ({ row, config }: DefaultRowActions) => {
  if (!row.original?.id) return;
  await Archive({ entity: config?.entity, id: row.original?.id });
};

export function ArchiveComponent({
  row,
  config,
  open,
  setOpen,
  record,
  setRecord,
}: DefaultRowActions) {
  if (config?.archiveCustomComponent) {
    return <>{config?.archiveCustomComponent({ row, config })}</>;
  }

  return (
    <Button
      {...(config?.disableArchiveButton && { disabled: true })}
      onClick={() => {
        setRecord?.(record);
        setOpen?.(true);
      }}
    >
      <ArchiveXIcon
        className={`h-3 w-3 ${config?.disableArchiveButton ? "bg-gray:300 opacity-50" : "text-destructive"}`}
      />
    </Button>
  );
}
/**
 *
 *
 * @RestoreComponent
 *
 */

const handleRestore = async ({ row, config }: DefaultRowActions) => {
  if (!row.original?.id) return;
  await Restore({ entity: config?.entity, id: row.original?.id });
};

export function RestoreComponent({ row, config }: DefaultRowActions) {
  if (config?.restoreCustomComponent) {
    return <>{config?.restoreCustomComponent({ row, config })}</>;
  }

  return (
    <Button
      onClick={() => {
        if (config?.restoreCustomAction) {
          config?.restoreCustomAction({ row, config });
          return;
        }
        handleRestore({ row, config });
      }}
    >
      <RotateCcw className="h-3 w-3 text-primary" />
    </Button>
  );
}
