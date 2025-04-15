'use client';
import { PlusIcon } from '@heroicons/react/20/solid';
import React from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';

import { GridContext } from '../Provider';

interface CreateButtonProps {
  className?: string;
  title?: string;
}

export default function CreateButton({
  className,
  title = '',
}: CreateButtonProps) {
  const { state, actions } = React.useContext(GridContext);

  if (state?.config?.hideCreateButton) return null;

  const entity = state?.config.entity;
  const buttonTitle = state?.config?.new_button_title || title;
  return (
    <Button
      className={cn('flex', className)}
      data-test-id={testIDFormatter(`${entity}-wzrd-grd-create-btn`)}
      loading={state?.createLoading}
      size="md"
      onClick={() => {
        if (state?.config?.new_button_action) {
          state?.config?.new_button_action();
        } else {
          actions?.handleCreate();
        }
      }}
    >
      {!state?.createLoading && <PlusIcon className="h-7 w-7 lg:h-5 lg:w-5" />}
      {buttonTitle ? <span className="mr-1">{buttonTitle}</span> : null}
    </Button>
  );
}
