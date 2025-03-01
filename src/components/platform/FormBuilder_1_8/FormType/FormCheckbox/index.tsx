/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ControllerFieldState, type ControllerRenderProps, type UseFormReturn } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type ICheckboxOptions, type IField } from "../../types";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  checkboxOptions: Record<string, ICheckboxOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormCheckbox({
  fieldConfig,
  checkboxOptions,
  form,
  formKey,
}: IProps) {

  // Helper function to handle the checkbox change
  const handleCheckboxChange = (field: ControllerRenderProps<Record<string, any>>, item?: ICheckboxOptions) => {
    // If no item is provided, treat it as a boolean checkbox
    if (!item) {
      return (checked: boolean) => {
        field.onChange(checked);
      };
    }

    // Handle array of strings case
    return (checked: boolean) => {
      const currentValue = field.value || [];
      if (Array.isArray(currentValue)) {
        return checked
          ? field.onChange([...currentValue, item.value])
          : field.onChange(currentValue.filter((value: any) => value !== item.value));
      } else {
        // Initialize as array if it wasn't one before
        return checked
          ? field.onChange([item.value])
          : field.onChange([]);
      }
    };
  };

  // Helper function to check if a value is checked
  const isChecked = (field: ControllerRenderProps<Record<string, any>>, item?: ICheckboxOptions) => {
    if (!item) {
      return field.value || false;
    }

    const currentValue = field.value;
    if (Array.isArray(currentValue)) {
      return currentValue.includes(item.value);
    }
    return false;
  };

  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        className="text-base"
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      {/* Render single checkbox for boolean values when no options are provided */}
      {(!checkboxOptions?.[fieldConfig?.name] || (checkboxOptions[fieldConfig.name]?.length ?? 0) === 0) && (
        <FormField
          control={form.control}
          name={fieldConfig?.name}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  disabled={fieldConfig.readonly||fieldConfig.disabled||field.disabled}
                  data-test-id={`${formKey}-chk-${fieldConfig?.name}`}
                  checked={isChecked(field)}
                  onCheckedChange={handleCheckboxChange(field)}
                  {...form.register(fieldConfig?.name)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
      {/* Render multiple checkboxes for string array values */}
      {checkboxOptions?.[fieldConfig?.name]?.map((item, index) => (
        <FormField
          key={String(item.value)}
          control={form.control}
          name={fieldConfig?.name}
          render={({ field }) => (
            <FormItem
              key={String(item.value)}
              className="flex flex-row items-center space-x-3 space-y-0"
            >
                <FormControl>
                <Checkbox
                  disabled={fieldConfig.readonly || fieldConfig.disabled || field.disabled}
                  data-test-id={`${formKey}-chk-${fieldConfig?.name}-${index + 1}`}
                  checked={isChecked(field, item)}
                  onCheckedChange={handleCheckboxChange(field, item)}
                  className={`focus:ring-1 focus:ring-primary focus:ring-offset-1 ${
                  (fieldConfig.disabled || field.disabled) &&
                  (!field.value || !isChecked(field, item))
                    ? 'bg-muted'
                    : ''
                  }`}
                  {...form.register(fieldConfig?.name)}
                />
                </FormControl>
              <FormLabel
                className="font-normal disabled:opacity-100"
                data-test-id={`${formKey}-chk-lbl-${fieldConfig.name}-${index + 1}`}
              >
                {item.label}
              </FormLabel>
            </FormItem>
          )}
        />
      ))}
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
      />
    </FormItem>
  );
}