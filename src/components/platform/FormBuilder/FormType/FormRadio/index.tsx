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
import { type IRadioOptions, type IField } from "../../types";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  radioOptions: Record<string, IRadioOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  formKey: string;
}

export default function FormRadio({
  fieldConfig,
  formRenderProps,
  radioOptions,
  form,
  formKey,
}: IProps) {
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig.label}
      </FormLabel>
      <FormControl>
        <Controller
          name={fieldConfig.name}
          control={form.control}
          rules={fieldConfig.required ? { required: true } : {}}
          render={({ field }) => (
            <RadioGroup
              data-test-id={`${formKey}-rdio-${fieldConfig.name}`}
              disabled={formRenderProps.field.disabled}
              onValueChange={(value) => {
                // Handle boolean conversions and pass the value to the form
                const processedValue = value === 'true' ? true : value === 'false' ? false : value === '' ? null : value;
                field.onChange(processedValue);
                formRenderProps.field.onChange(processedValue);
              }}
              value={field.value === null || field.value === undefined ? '' : String(field.value)}
              className={`${fieldConfig.radioOrientation === "vertical" && "flex-col"} flex gap-2`}
            >
              {/* We don't need the hidden null option anymore */}
              
              {radioOptions?.[fieldConfig?.id]?.map((option, index) => (
                <FormItem
                  key={index}
                  className="flex items-center gap-2 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem
                      value={option.value != null ? String(option.value) : ""}
                      data-test-id={`${formKey}-opt-${index + 1}-${fieldConfig.name}`}
                      checked={String(field.value) === String(option.value)}
                    />
                  </FormControl>
                  <FormLabel
                    className="font-normal"
                    data-test-id={`${formKey}-lbl-${option.label}-${fieldConfig.name}`}
                  >
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          )}
        />
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
      />
    </FormItem>
  );
}