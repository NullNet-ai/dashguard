import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

interface IProps {
  field: Record<string, any>;
  index: number;
  handleSubmitFieldValues: () => Promise<void>;
  isSearchOpen: boolean;
}

export default function CreateUpdateButton({
  field,
  isSearchOpen,
  handleSubmitFieldValues,
}: IProps) {
  return (
    <Fragment>
      {!isSearchOpen && (
        <>
          <Button
            className="items-center gap-1 text-sm"
            form="hook-form"
            name={
              'Basic Details' +
              `${field.code ? 'FormUpdateButton' : 'FormCreateButton'}`
            }
            size="xs"
            type="button"
            variant="default"
            onClick={handleSubmitFieldValues}
          >
            <PlusIcon className="h-4 w-4" />
            {field.code ? 'Update' : 'Create'}
          </Button>
          <Separator className="mr-1 py-3" orientation="vertical" />
        </>
      )}
    </Fragment>
  );
}
