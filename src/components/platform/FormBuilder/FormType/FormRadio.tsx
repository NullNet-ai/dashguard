import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
  Controller,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { type IRadioOptions, type IField } from "../type";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  radioOptions: Record<string, IRadioOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
}

export default function FormRadio({
  fieldConfig,
  formRenderProps,
  radioOptions,
  form,
}: IProps) {
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig.label}
      </FormLabel>
      <FormControl>
        <Controller
          name={fieldConfig.name}
          control={form.control}
          rules={fieldConfig.required ? { required: true } : {}}
          render={({ field }) => (
            <RadioGroup
              {...field}
              data-test-id={fieldConfig?.name}
              disabled={formRenderProps.field.disabled}
              onValueChange={(value) => {
                field.onChange(value);
              }}
              value={field.value}
              className={`${fieldConfig.radioOrientation === "vertical" && "flex-col"} flex space-y-1`}
            >
              {radioOptions?.[fieldConfig?.id]?.map((option, index) => (
                <FormItem
                  key={index}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem
                      value={option.value}
                      data-test-id={fieldConfig.name + "option" + index + 1}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
