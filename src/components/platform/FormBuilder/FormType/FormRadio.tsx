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
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";
;

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
        data-test-id={kebabCase(formKey + capitalize(fieldConfig.name) + "RadioFormLabel")}
      >
        {fieldConfig.label}
      </FormLabel>
      <FormControl>
        <Controller
          name={capitalize(fieldConfig.name)}
          control={form.control}
          rules={fieldConfig.required ? { required: true } : {}}
          render={({ field }) => (
            <RadioGroup
              {...field}
              data-test-id={kebabCase(
                formKey + fieldConfig?.name + "RadioGroup",
              )}
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
                      data-test-id={kebabCase(
                        formKey + capitalize(fieldConfig.name) + "option" + (index + 1),
                      )}
                    />
                  </FormControl>
                  <FormLabel
                    className="font-normal"
                    data-test-id={kebabCase(
                      formKey + capitalize(fieldConfig.name) + "FormLabel" + option.label,
                    )}
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
        data-test-id={kebabCase(
          formKey + capitalize(fieldConfig.name) + "RadioErrorMessage",
        )}
      />
    </FormItem>
  );
}
