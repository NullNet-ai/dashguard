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
import { Input } from "~/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

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
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const isInputChanging = useRef(false);

  const getInputFieldName = (optionValue: string | boolean) => `${fieldConfig.name}_input_${String(optionValue)}`;

  useEffect(() => {
    const formValue = form.getValues(fieldConfig.name);
    if (formValue) {
      const stringFormValue = String(formValue);
      if (!selectedValue || selectedValue !== stringFormValue) {
        setSelectedValue(stringFormValue);
      }
    }
  }, [form, fieldConfig.name]);

  const withInput = radioOptions?.[fieldConfig?.id]?.find((option) => option.with_input);

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
            <div className="space-y-2">
              <RadioGroup
                {...field}
                data-test-id={`${formKey}-rdio-${fieldConfig.name}`} 
                disabled={formRenderProps.field.disabled}
                onValueChange={(value) => {
                  if (isInputChanging.current) return;
                  const processedValue = value === 'true' ? true : value === 'false' ? false : value === '' ? null : value;
                  field.onChange(processedValue);
                  formRenderProps.field.onChange(processedValue);
                  setSelectedValue(value);
                }}
                value={withInput ? selectedValue || "" : field.value}
                className={`${fieldConfig.radioOrientation === "vertical" && "flex-col"} flex gap-2`}
              >
                {/* We don't need the hidden null option anymore */}

                {radioOptions?.[fieldConfig?.id]?.map((option, index) => (
                  <div key={index} className={`flex gap-2 ${fieldConfig.radioOrientation === "vertical" && withInput && "flex-col"}`}>
                    <FormItem
                      className={cn('flex items-center gap-2 space-y-0', {
                        'items-center': fieldConfig.radioOrientation === "vertical" && option.with_input && selectedValue !== String(option.value),
                        'items-baseline': fieldConfig.radioOrientation === "vertical" && option.with_input && selectedValue === String(option.value)
                      })}
                    >
                      <FormControl>
                        <RadioGroupItem
                          value={option.value != null ? String(option.value) : ""}
                          data-test-id={`${formKey}-opt-${index + 1}-${fieldConfig.name}`}
                        />
                      </FormControl>
                      <div
                        className={cn("flex gap-2 items-center", {
                          "flex-col items-start align-baseline gap-0": fieldConfig.radioOrientation === "vertical" && option.with_input
                        })}
                      >
                        <FormLabel
                          className="font-normal"
                          data-test-id={`${formKey}-lbl-${option.label}-${fieldConfig.name}`}
                        >
                          {option.label}
                        </FormLabel>
                        {option.with_input && selectedValue === String(option.value) && (
                          <Controller
                            name={getInputFieldName(option.value)}
                            control={form.control}
                            defaultValue=""
                            render={({ field: inputField }) => (
                              <Input
                                {...inputField}
                                placeholder={option.inputPlaceholder || 'Please specify'}
                                data-test-id={`${formKey}-input-${option.value}-${fieldConfig.name}`}
                                disabled={formRenderProps.field.disabled}
                                className="max-w-max h-full rounded-none border-t-0 border-x-0 focus-visible:ring-transparent"
                                onFocus={() => {
                                  if (selectedValue !== String(option.value)) {
                                    setSelectedValue(String(option.value));
                                    form.setValue(fieldConfig.name, option.value, { shouldValidate: true });
                                  }
                                }}
                                onChange={(e) => {
                                  isInputChanging.current = true;
                                  inputField.onChange(e);
                                  if (selectedValue !== String(option.value)) {
                                    setSelectedValue(String(option.value));
                                    form.setValue(fieldConfig.name, option.value, { shouldValidate: true });
                                  }
                                  setTimeout(() => {
                                    isInputChanging.current = false;
                                  }, 0);
                                }}
                              />
                            )}
                          />
                        )}
                      </div>
                    </FormItem>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        />
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
      />
    </FormItem>
  );
}