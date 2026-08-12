import React, { useState, useCallback, useRef, useEffect } from 'react';
import FormSelect from '~/components/platform/FormBuilder/FormType/FormSelect';
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule';
import { FormField } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { FormSchema } from '../schema';


interface CustomFieldProps {
  form: any;
  fieldConfig: {
    name: string;
  };
}

const PersonalSubCategory: React.FC<CustomFieldProps> = ({
  form,
  fieldConfig,
}) => {
  const fieldName = fieldConfig.name + '_other_input';
  const inputRef = useRef<HTMLInputElement>(null);

  // Use a separate state to avoid form re-renders affecting the radio
  const [inputValue, setInputValue] = useState(form.getValues(fieldName) || '');
  const [createableOptions, setCreateableOptions] = useState([
    { label: 'Sub Category', value: 'Sub Category' },
  ]);


  // Maintain focus after each change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue]);

  // Memoize the onChange handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Update form value without triggering validation
      form.setValue(fieldName, newValue, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    },
    [fieldName, form],
  );

  return (
    <div className="flex items-center py-1">
      <FormModule
        form={form}
        formKey="subCategory"
        formSchema={FormSchema}
        fields={[
          {
            formType: 'select',
            name: 'sub_category',
            label: 'Sub Category',
            placeholder: 'Select Sub Category',
            fieldClassName:'max-w-[50%] flex-1',
            id: 'sub_category',
            selectEnableCreate: true,
            selectSearchable: true,
            selectOnCreateRecord: async (value: string) => {
              setCreateableOptions([...createableOptions, { label: value, value }]);
              return Promise.resolve({
                label: value,
                value,
              });
            },
          },
        ]}
        subConfig={{
          selectOptions: {
            sub_category: createableOptions,
          },
        }}
      />
      {/* <FormField
        control={form.control}
        name="subCategory"
        render={({ field, fieldState }: any) => {
          return (
            <FormSelect
              fieldConfig={{
                selectSearchable: true,
                id: 'subCategory',
                name: 'subCategory',
                label: '',
                placeholder: 'Select Sub Category',
                selectEnableCreate: true,
                selectOnCreateRecord: async (value: string) => {
                  return { label: value, value };
                },
              }}
              form={form}
              formKey="SubCategory"
              formRenderProps={{ field, fieldState }}
              selectOptions={{
                subCategory: [{ label: 'Sub Category', value: 'Sub Category' }],
              }}
            />
          );
        }}
      /> */}
    </div>
  );
};

export default PersonalSubCategory;