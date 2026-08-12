'use client';
import { PlusIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { testIDFormatter } from '~/utils/formatter';
import { useToast } from '~/context/ToastProvider';
import { Create } from '../../Grid/Action/Create';

interface CreateButtonProps {
  className?: string;
  entity?: string;
  application?: string;
}

export default function CreateButtonTabs({
  className,
  entity,
  application
}: CreateButtonProps) {
  const router = useRouter();
  const [createLoading, setCreateLoading] = useState(false);
  const toast = useToast();
  

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      if (!entity) {
        toast.error('Entity is required');
        setCreateLoading(false);
        return;
      }
      const route = await Create({
        entity: entity,
        is_from_grid: true,
        // defaultValues:
        //   entity === 'contact'
        //     ? {
        //         categories: ['Contact', 'Employee'],
        //         id: 'code',
        //       }
        //     : undefined,
        enableAutoCreate: true,
      });

      router.push(route);
    } catch (error) {
      console.error('An error occurred while creating a record', error);
      setCreateLoading(false);
    }
  };

  if(application === 'grid') {
    return null
  }

  return (
    <Button
      className={cn('flex', className)}
      data-test-id={testIDFormatter(`${entity}-wzrd-grd-create-btn`)}
      loading={createLoading}
      size={'sm'}
      onClick={() => {
        handleCreate();
      }}
    >
      {!createLoading && <PlusIcon className="h-7 w-7 lg:h-5 lg:w-5" />}
      <span className="mr-1">New</span>
    </Button>
  );
}
