'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import CustomComponent from '../_components/custom-component';
import { useState, use } from 'react';
import SelectMultiCustomComponent from '../_components/select-multiple';

const FormSchema = z.object({
  field_1750197302466: z.string(),
});

const initialCreatableOptions = [
  { label: "Option 1", value: "option_1" },
  { label: "Option 2", value: "option_2" },
  { label: "Option 3", value: "option_3" },
];

export default function Page(props: any) {
  const params = use(props.params) as { shell_type?: "wizard" | "record" };

  const {
    defaultValues
  } = props;

  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const [creatableOptions, setCreatableOptions] = useState(initialCreatableOptions);

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error('Failed to submit Form Label');
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Form Label"
      handleSubmit={handleSave}
      formKey="formlabel"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
        {
          id: 'field_1750197302466',
          formType: 'draggable',
          name: 'field_1750197302466',
          label: 'New Field 1',
          description: 'Field Description',
          placeholder: '',
          fieldClassName: '',
          draggableConfig: [
            {
              fields: {
                id: 'field1',
                name: 'field1-multiselect',
                label: 'Field 1',
                placeholder: 'Enter value',
                formType: 'custom-component',
                multiSelectMaxSelected: 5, // optional
                multiSelectUseStringValues: false,
                multiSelectShowCreatableItem: true, // 
                draggableComponent: SelectMultiCustomComponent,
                selectOptions: creatableOptions,
              },
            },
          ],
          fieldStyle: {},
        },
      ]}
    />
  );
}
