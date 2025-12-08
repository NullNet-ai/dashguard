import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Button } from '~/components/ui/button';

interface IProps {
  field: Record<string, any>;
  index: number;
  handleResetForm: () => void;
}

export default function CancelButton({ field, index, handleResetForm }: IProps) {
  return (
    <Fragment>
      {(field.code || (!field.code && index > 0)) && (
        <Button
          size="xs"
          type="button"
          variant="outline"
          onClick={handleResetForm}
        >
          <XMarkIcon className="h-4 w-4" />
          Cancel
        </Button>
      )}
    </Fragment>
  );
}
