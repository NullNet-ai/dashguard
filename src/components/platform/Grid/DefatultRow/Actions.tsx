"use client";
import { type DefaultRowActions } from "../types";
import { Edit } from "../Action/Edit";
import { Delete } from "../Action/Delete";
import { Archive } from "../Action/Archived";
import { Restore } from "../Action/Restore";
import { Button } from "@headlessui/react";
import {
  ArchiveIcon,
  ArchiveX,
  ArchiveXIcon,
  PencilIcon,
  RotateCcw,
  TrashIcon,
} from "lucide-react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

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
    status:
      row.original?.status === "Archived"
        ? (row.original?.previous_status ?? "")
        : row.original?.status,
  });
};

export function EditComponent({ row, config, viewMode }: DefaultRowActions) {
  if (config?.editCustomComponent) {
    const result = config?.editCustomComponent({
      row,
      config,
    });
    if (result) {
      return <>{result}</>;
    }
  }
  if (viewMode === "card") {
    return (
      <DropdownMenuItem
        className="relative flex cursor-pointer items-center gap-2 text-primary"
        onClick={() => {
          if (config?.editCustomAction) {
            config?.editCustomAction({ row, config });
            return;
          }
          handleEdit({ row, config });
        }}
      >
        <PencilIcon className="h-3 w-3 text-primary" />
        <span>Edit</span>
      </DropdownMenuItem>
    );
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

export function DeleteComponent({ row, config, viewMode }: DefaultRowActions) {
  if (config?.deleteCustomComponent) {
    const result = config?.deleteCustomComponent({
      row,
      config,
    });
    if (result) {
      return <>{result}</>;
    }
  }

  if (viewMode === "card") {
    return (
      <DropdownMenuItem
        className="relative flex cursor-pointer items-center gap-2 text-red-500"
        onClick={() => {
          if (config?.deleteCustomAction) {
            config?.deleteCustomAction({ row, config });
            return;
          }
          handleDelete({ row, config });
        }}
      >
        <ArchiveIcon className="h-3 w-3 text-destructive" />
        <span>Delete</span>
      </DropdownMenuItem>
    );
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
      <ArchiveIcon className="h-3 w-3 text-destructive" />
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
  viewMode,
}: DefaultRowActions) {
  if (config?.archiveCustomComponent) {
    const result = config?.archiveCustomComponent({
      row,
      config,
      setOpen,
      open,
      setRecord,
      record,
    });
    if (result) {
      return <>{result}</>;
    }
  }
  if (viewMode === "card") {
    return (
      <DropdownMenuItem
        className="relative flex cursor-pointer items-center gap-2 text-red-500"
        onClick={() => {
          setRecord?.(record);
          setOpen?.(true);
        }}
      >
        <ArchiveIcon
          className={`h-3 w-3 ${row.original.disabled ? "bg-gray:300 opacity-50" : "text-destructive"}`}
        />
        <span>Archive</span>
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      {...(row.original.disabled && { disabled: true })}
      onClick={() => {
        setRecord?.(record);
        setOpen?.(true);
      }}
    >
      <ArchiveIcon
        className={`h-3 w-3 ${row.original.disabled ? "bg-gray:300 opacity-50" : "text-destructive"}`}
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

export function RestoreComponent({ row, config, viewMode }: DefaultRowActions) {
  if (config?.restoreCustomComponent) {
    const result = config?.restoreCustomComponent({
      row,
      config,
    });
    if (result) {
      return <>{result}</>;
    }
  }
  if (viewMode === "card") {
    return (
      <DropdownMenuItem
        className="relative flex cursor-pointer items-center gap-2 text-primary"
        onClick={() => {
          if (config?.restoreCustomAction) {
            config?.restoreCustomAction({ row, config });
            return;
          }
          handleRestore({ row, config });
        }}
      >
        <RotateCcw className="h-3 w-3 text-primary" />
        <span>Restore</span>
      </DropdownMenuItem>
    );
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
