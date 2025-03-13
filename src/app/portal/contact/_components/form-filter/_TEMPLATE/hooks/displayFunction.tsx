import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

type UseEnableEditModeProps = {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  displayType: string;
  fieldArrayName: string;
};

const useEnableEditMode = ({
  form,
  displayType,
  fieldArrayName,
}: UseEnableEditModeProps) => {
  useEffect(() => {
    if (displayType === 'form') {
      form.setValue(
        fieldArrayName as any,
        form.getValues()[fieldArrayName]?.map((field: Record<string, any>) => ({
          ...field,
        })),
      );
    }
  }, [displayType, form, fieldArrayName]);
};

export default useEnableEditMode;
