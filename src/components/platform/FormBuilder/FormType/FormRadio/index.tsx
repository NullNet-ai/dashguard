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
  radioOptions: _radioOptions,
  form,
  formKey,
}: IProps) {


  const radioOptions = {
    [fieldConfig?.id]: [
      ...(_radioOptions?.[fieldConfig?.id] || []),
      { label: 'hidden', value: '' },
    ]
  }

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
              {...field}
              data-test-id={`${formKey}-rdio-${fieldConfig.name}`}
              disabled={formRenderProps.field.disabled}
              onValueChange={(value) => {
                formRenderProps.field.onChange(value === 'true' ? true : value === 'false' ? false : value);
              }}
              value={field.value}
              className={`${fieldConfig.radioOrientation === "vertical" && "flex-col"} flex gap-2`}
            >
              {radioOptions?.[fieldConfig?.id]?.map((option, index) => {
                return (
                <div key={index} className={`flex gap-2 ${fieldConfig.radioOrientation === "vertical" && option.renderComponent && "flex-col"}`}>
                  <FormItem
                    className={cn('flex items-center gap-2 space-y-0', {
                      'items-center': fieldConfig.radioOrientation === "vertical" && option.renderComponent && field.value !== String(option.value),
                      'items-baseline': fieldConfig.radioOrientation === "vertical" && option.renderComponent && field.value === String(option.value)
                    })}
                  >
                    <FormControl>
                      <RadioGroupItem
                        value={String(option.value)}
                        data-test-id={`${formKey}-opt-${index + 1}-${fieldConfig.name}`}
                        className={cn(`${option.label === 'hidden' ? 'w-0 h-0 absolute opacity-0' : ''}`)}
                      />
                    </FormControl>
                    <div
                      className={cn("flex gap-2 items-center", {
                        "flex-col items-start align-baseline gap-0 w-full": fieldConfig.radioOrientation === "vertical" && option.renderComponent,
                      },
                      `${option.label === 'hidden' ? 'w-0 h-0 absolute opacity-0' : ''}`
                    )}
                    >
                      <FormLabel
                        className="font-normal"
                        data-test-id={`${formKey}-lbl-${option.label}-${fieldConfig.name}`}
                      >
                        {option.label}
                      </FormLabel>
                      {option.renderComponent && 
                        <div className={cn(`text-md font-normal w-full`, 
                          `${field.value !== String(option.value) ? 'h-0 opacity-0 invisible pointer-events-none' : ''}`
                        )} 
                        >
                          {option.renderComponent({form, field, fieldConfig})}
                        </div>
                      }
                    </div>
                  </FormItem>
                </div>
              )
              })}
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