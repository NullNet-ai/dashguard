import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule';
import { Form } from '~/components/ui/form';
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export default function NameInput(tab : any) {
  const form = useForm();
  return (
    <div className="border-b p-4">
      <Form {...form}>
        <FormModule
          form={form}
          formKey="name:grid-filter-input"
          formSchema={formSchema}
          fields={[
            {
              formType: 'input',
              name: 'name',
              label: 'Name',
              placeholder: 'Filter Name',
              id: 'name',
            },
          ]}
        />
      </Form>
    </div>
  );
}
