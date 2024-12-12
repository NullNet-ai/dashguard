/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UseFormReturn } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type ICheckboxOptions, type IField } from "../type";

interface IProps {
  fieldConfig: IField;
  checkboxOptions: Record<string, ICheckboxOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
}

export default function FormCheckbox({
  fieldConfig,
  checkboxOptions,
  form,
}: IProps) {
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} className="text-base">
        {fieldConfig?.label}
      </FormLabel>
      {checkboxOptions?.[fieldConfig?.name]?.map((item, index) => (
        <FormField
          key={item.value}
          control={form.control}
          name={fieldConfig?.name}
          render={({ field }) => {
            return (
              <FormItem
                key={item.value}
                className="flex flex-row items-center space-x-3 space-y-0"
              >
                <FormControl>
                  <Checkbox
                    disabled={field.disabled || fieldConfig?.disabled}
                    data-test-id={fieldConfig?.name + index}
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
                <FormLabel className="font-normal">{item.label}</FormLabel>
              </FormItem>
            );
          }}
        />
      ))}
      <FormMessage />
    </FormItem>
  );
}
