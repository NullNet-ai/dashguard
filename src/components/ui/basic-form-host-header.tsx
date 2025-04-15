import { EllipsisVertical, SaveIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from '~/components/ui/button';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';

interface IEllipsisOptions {
  id: number;
  name: string;
  onClick?: () => void;
}

interface IProps {
  label?: string | React.ReactElement;
  ellipseOptions: IEllipsisOptions[];
  isDisable?: boolean;
  isLock: boolean;
  form?: any;
  handleSave?: () => void;
  handleCancel?: () => void;
  handleUnlock: () => void;
  hideEllipseOptions?: boolean;
  hideSaveCancelButton?: boolean;
  isSaving?: boolean;
}

export default function BasicFormHostHeader({
  isLock,
  label,
  ellipseOptions = [],
  isDisable,
  handleSave,
  handleCancel,
  handleUnlock,
  hideEllipseOptions = false,
  hideSaveCancelButton = true,
  isSaving = false,
}: IProps) {
  const [isSubmitting, setIsSubmitting] = useState(isSaving);

  useEffect(() => {
    setIsSubmitting(isSaving);
  }, [isSaving]);

  const Label =
    typeof label === 'string' ? (
      <span className="text-sm font-semibold leading-none tracking-tight">
        {label}
      </span>
    ) : (
      label
    );

  return (
    <div className={'flex flex-row items-center justify-between p-2'}>
      {Label}
      <div className="flex gap-2">
        {isLock && !hideSaveCancelButton ? (
          <Button
            size={'icon'}
            variant={'ghost'}
            onClick={handleUnlock}
            className="m-auto h-6 w-6 rounded-full"
          >
            <LockClosedIcon className="h-5 w-5 cursor-pointer rounded-full border" />
          </Button>
        ) : (
          <>
            {!hideSaveCancelButton && (
              <Fragment>
                <Button
                  variant={'default'}
                  onClick={handleSave}
                  type="button"
                  loading={isSubmitting}
                  size={'xs'}
                  className="items-center gap-1 text-sm"
                  // {...props}
                >
                  <SaveIcon className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant={'outline'}
                  onClick={handleCancel}
                  type="button"
                  size={'xs'}
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </Button>
              </Fragment>
            )}

            {!hideEllipseOptions && (
              <DropdownMenu>
                {!isDisable ? (
                  <DropdownMenuTrigger>
                    <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                ) : (
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                )}

                <DropdownMenuContent align="end" side="bottom" style={{zIndex: 130}}>
                  {ellipseOptions?.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={option.onClick}
                      className="flex cursor-pointer gap-2"
                    >
                      {option.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>
    </div>
  );
}
