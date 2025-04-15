'use client';
import { Button } from '@headlessui/react';
import { ArchiveIcon, PencilIcon, RotateCcw, Trash2 } from 'lucide-react';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import { Archive } from '../Action/Archived';
import { Delete } from '../Action/Delete';
import { Edit } from '../Action/Edit';
import { Restore } from '../Action/Restore';
import { type DefaultRowActions } from '../types';
import { getActionConditionResult } from '../utils/getActionConditionResult';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';

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
      row.original?.status === 'Archived'
        ? (row.original?.previous_status ?? '')
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
  const editState = config?.rowActions?.edit?.state as any;

  const { hidden: isHidden, disabled: isDisabled } = getActionConditionResult({
    row_data: row?.original,
    state_conditions: editState,
  });

  if (isHidden) return null;

  if (viewMode === 'card') {
    return (
      <DropdownMenuItem
        disabled={isDisabled}
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
    <Tooltip key={'edit'} delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          disabled={isDisabled}
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
      </TooltipTrigger>
      <TooltipContent  align='center' side='left' sideOffset={15} className="z-[9999]">
        <p>{'Edit'}</p>
      </TooltipContent>
    </Tooltip>
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

  const deleteState = config?.rowActions?.delete?.state as any;

  const { hidden: isHidden, disabled: isDisabled } = getActionConditionResult({
    row_data: row?.original,
    state_conditions: deleteState,
  });

  if (isHidden) return null;

  if (viewMode === 'card') {
    return (
      <DropdownMenuItem
        className="relative flex cursor-pointer items-center gap-2 text-red-500"
        disabled={isDisabled}
        onClick={() => {
          if (config?.deleteCustomAction) {
            config?.deleteCustomAction({ row, config });
            return;
          }
          handleDelete({ row, config });
        }}
      >
        <Trash2 className="h-3 w-3 text-destructive" />
        <span>Delete</span>
      </DropdownMenuItem>
    );
  }

  return (
    <Tooltip key={'delete'}>
      <TooltipTrigger asChild>
        <Button
          disabled={isDisabled}
          onClick={() => {
            if (config?.deleteCustomAction) {
              config?.deleteCustomAction({ row, config });
              return;
            }
            handleDelete({ row, config });
          }}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="z-[9999]">
        <p>{'Delete'}</p>
      </TooltipContent>
    </Tooltip>
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
  const { archiveCustomComponent, rowActions } = config ?? {};
  if (archiveCustomComponent) {
    const result = archiveCustomComponent({
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

  const archiveState = rowActions?.archive?.state as any;

  const { hidden: isHidden, disabled: isDisabled } = getActionConditionResult({
    row_data: row?.original,
    state_conditions: archiveState,
  });

  if (isHidden) return null;

  if (viewMode === 'card') {
    return (
      <DropdownMenuItem
        disabled={isDisabled}
        className="relative flex cursor-pointer items-center gap-2 text-red-500"
        onClick={() => {
          setRecord?.(record);
          setOpen?.(true);
        }}
      >
        <ArchiveIcon
          className={`h-3 w-3 ${row.original.disabled ? 'bg-gray:300 opacity-50' : 'text-destructive'}`}
        />
        <span>Archive</span>
      </DropdownMenuItem>
    );
  }

  return (
    <Tooltip key={'archive'} delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          {...((row.original.disabled || isDisabled) && { disabled: true })}
          onClick={() => {
            setRecord?.(record);
            setOpen?.(true);
          }}
        >
          <ArchiveIcon
            className={`h-3 w-3 ${row.original.disabled || isDisabled ? 'bg-gray:300 opacity-50' : 'text-destructive'}`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent align='center' side='left' sideOffset={45} className="z-[9999]">
        <p>{'Archive'}</p>
      </TooltipContent>
    </Tooltip>
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

  const restoreState = config?.rowActions?.restore?.state as any;

  const { hidden: isHidden, disabled: isDisabled } = getActionConditionResult({
    row_data: row?.original,
    state_conditions: restoreState,
  });

  if (isHidden) return null;

  if (viewMode === 'card') {
    return (
      <DropdownMenuItem
        disabled={isDisabled}
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
    <Tooltip key={'restore'} delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          disabled={isDisabled}
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
      </TooltipTrigger>
      <TooltipContent align='center' side='left' sideOffset={45} className="z-[9999]">
        <p>{'Restore'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
