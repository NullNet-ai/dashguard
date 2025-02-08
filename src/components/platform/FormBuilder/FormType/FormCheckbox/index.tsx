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
import { cn } from "~/lib/utils";

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

  const handleCheckboxChange = (field: ControllerRenderProps<Record<string, any>>, item?: ICheckboxOptions) => {
    if (!item) {
      return (checked: boolean) => {
        field.onChange(checked);
      };
    }

    return (checked: boolean) => {
      const currentValue = field.value || [];
      if (Array.isArray(currentValue)) {
        return checked
          ? field.onChange([...currentValue, item.value])
          : field.onChange(currentValue.filter((value: any) => value !== item.value));
      } else {
        return checked
          ? field.onChange([item.value])
          : field.onChange([]);
      }
    };
  };

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
      {/* Single Checkbox for boolean values */}
      {(!checkboxOptions?.[fieldConfig?.name] || (checkboxOptions[fieldConfig.name]?.length ?? 0) === 0) && (
        <FormField
          control={form.control}
          name={fieldConfig?.name}
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  disabled={fieldConfig.readonly || fieldConfig.disabled || field.disabled}
                  data-test-id={`${formKey}-chk-${fieldConfig?.name}`}
                  checked={isChecked(field)}
                  onCheckedChange={handleCheckboxChange(field)}
                  className={cn(fieldState.error && "border-destructive")}
                  {...form.register(fieldConfig?.name)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
      {/* Checkbox Group for array values */}
      {checkboxOptions?.[fieldConfig?.name]?.map((item, index) => (
        <FormField
          key={String(item.value)}
          control={form.control}
          name={fieldConfig?.name}
          render={({ field, fieldState }) => (
            <FormItem
              className="flex flex-row items-center space-x-3 space-y-0"
            >
              <FormControl>
                <Checkbox
                  className={cn(fieldState.error && "border-destructive")}
                  disabled={fieldConfig.readonly || fieldConfig.disabled || field.disabled}
                  data-test-id={`${formKey}-chk-${fieldConfig?.name}-${index + 1}`}
                  checked={field?.value?.includes(item.value)}
                  onCheckedChange={(checked) => {
                    return checked
                      ? field?.onChange([...(field?.value || []), item.value])
                      : field?.onChange(
                          field?.value?.filter(
                            (value: any) => value !== item.value,
                          ),
                        );
                  }}
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