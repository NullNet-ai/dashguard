'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleMinus, Plus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import FormModule from '~/components/platform/FormBuilder/components/ui/FormModule/FormModule';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useManageFilter } from '../Provider';

const OPERATORS = [
  { value: 'equal', label: 'Equals' },
  { value: 'not_equal', label: 'Not Equal' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'greater_than_or_equal', label: 'Greater Than Or Equal' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'less_than_or_equal', label: 'Less Than Or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
  { value: 'is_between', label: 'Is Between' },
  { value: 'is_not_between', label: 'Is Not Between' },
  { value: 'like', label: 'Like' },
];
const ZodSchema = z.object({
  filters: z.array(
    z.discriminatedUnion('type', [
      z.object({
        field: z.string().min(1, "Field is required"),
        operator: z.string().min(1, "Operator is required"),
        label: z.string(),
        // values: z.array(z.string()).min(1, "Value is required"),
        values: z.string().min(1, "Value is required"),
        type: z.literal('criteria'),
        default: z.boolean(),
      }),
      z.object({
        operator: z.enum(['and', 'or']),
        type: z.literal('operator'),
        default: z.boolean(),
      }),
    ])
  ),
});

export default function FilterContent() {
  const { actions, state } = useManageFilter();
  const { handleUpdateFilter } = actions;
  const { filterDetails, columns } = state ?? {};

  const form = useForm<z.infer<typeof ZodSchema>>({
    resolver: zodResolver(ZodSchema),
    defaultValues: {
      filters: filterDetails?.default_filter ?? [
        {
          field: '',
          operator: 'equal',
          label: '',
          values: [],
          type: 'criteria',
          default: true,
        },
      ],
    },
    shouldFocusError: false,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'filters',
  });

  form.watch((fields) => {
    // values must be an array
    handleUpdateFilter({ default_filter: fields.filters });
  });


  const handleAppend = () => {
    const newFilter = {
      field: '',
      operator: 'equal',
      label: '',
      values: [],
      type: 'criteria',
      default: true,
    };

    append({
      operator: 'and',
      type: 'operator',
      default: true,
    });
    append(newFilter as any);
    const updatedFilters = form.getValues().filters;
    handleUpdateFilter({ default_filter: updatedFilters });
  };

  const handleRemoveFilter = (index: number) => {
    remove(index);
    handleUpdateFilter({ default_filter: form.getValues().filters });
  };

  const handleUpdateJunctionOperator = (index: number, operator: string) => {
    const updatedFilters = [...form.getValues().filters];
    updatedFilters[index]!.operator = operator;
    form.setValue('filters', updatedFilters);
    handleUpdateFilter({ default_filter: updatedFilters });
  };

  const handleValidate = () => {
    console.info("SAVING FORM")
  }

  return (
    <div className="mt-5 space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="flex justify-between">
      <Button
          variant="ghost"
          size="sm"
          onClick={form.handleSubmit(handleValidate)}
          className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          Validate Filter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAppend}
          className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Filter
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          {fields.map((field, index) => {
            const prefix = `filters.${index}.`;
            return (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_2fr_auto] items-start gap-2"
              >
                {index > 0 && field.type === "operator" && (
                  <div className="col-span-4 mb-2">
                    <Select
                      defaultValue="and"
                      value={field.operator}
                      onValueChange={(operator) =>
                        handleUpdateJunctionOperator(index, operator)
                      }
                    >
                      <SelectTrigger className="w-[100px] border-gray-200 bg-white">
                        <SelectValue placeholder="AND" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {field.type === 'criteria' && (
                  <>
                    <FormModule
                      form={form}
                      formKey="filters"
                      formSchema={ZodSchema}
                      fields={[
                        {
                          id: `${prefix}.field`,
                          formType: 'select',
                          name: `${prefix}.field`,
                          placeholder: 'Select field',
                          selectSearchable: true
                        },
                        {
                          id: `${prefix}.operator`,
                          formType: 'select',
                          name: `${prefix}.operator`,
                          placeholder: 'Select operator',
                          selectSearchable: true
                        },
                        {
                          id: `${prefix}.values`,
                          formType: 'multi-select',
                          name: `${prefix}.values`,
                          placeholder: 'Enter values',
                          multiSelectEnableCreate: true,
                          multiSelectShowCreatableItem: false,
                        },
                      ]}
                      subConfig={{
                        selectOptions: {
                          [`${prefix}.field`]:
                            columns?.map((column) => ({
                              label: column.label,
                              value: column.accessorKey,
                            })) || [],
                          [`${prefix}.operator`]: OPERATORS,
                        },
                      }}
                    />
                    {fields.length > 1 && (
                      <Button
                        onClick={() => handleRemoveFilter(index)}
                        Icon={CircleMinus}
                        iconPlacement="left"
                        iconClassName="text-red-600 h-4 w-4"
                        variant="ghost"
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Form>
    </div>
  );
}
