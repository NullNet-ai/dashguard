import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { IFieldFilterActions, type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";
;

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  formKey:string;
  value?: string;
  fieldFilterActions?: IFieldFilterActions
}

export default function FormNumber({
  fieldConfig,
  formRenderProps,
  icon,
  form,
  fieldFilterActions,
  formKey
}: IProps) {
  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;
  const { handleSearch, ...restFieldFilterActions } = fieldFilterActions ?? {};

  //! FOR NOW DIRTY IMPLEMENTATION WILL BE HANDLE LATER
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   form.setValue(`${fieldConfig?.name}`, e.target.value, {
  //     shouldDirty: true,
  //     shouldValidate: true,
  //     shouldTouch: true,
  //   });
  // };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // If the input is empty (user cleared it), set to undefined
    // Otherwise convert to number
    const finalValue = value === "" ? undefined : +value;

    form.setValue(fieldConfig?.name, finalValue, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    if(handleSearch){
      handleSearch(e.target.value);
    }
  }
  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "NumberInputFormLabel")}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Input
          // {...form.register(fieldConfig?.name)}
          {...formRenderProps.field}
          data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "NumberInput")}
          readOnly={fieldConfig?.readonly ?? false}
          type="number"
          inputMode="decimal"
          className={`no-spinner ${isDisabled && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}`}
          disabled={isDisabled}
          placeholder={fieldConfig?.placeholder}
          iconPlacement="left"
          Icon={icon}
          hasError={!!formRenderProps.fieldState.error}
          onChange={handleChange}
          {...(restFieldFilterActions ?? {})}
        />
      </FormControl>
      <FormMessage data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "NumberInputErrorMessage")}/>

      {/* <DevTool  control={form.control} /> */}
    </FormItem>
  );
}
