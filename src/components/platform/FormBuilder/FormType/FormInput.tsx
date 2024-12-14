import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {IFieldFilterActions,  type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";


interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  fieldFilterActions?: IFieldFilterActions
  formKey:string;
}

export default function FormInput({
  fieldConfig,
  formRenderProps,
  icon,
  value,
  fieldFilterActions,
  formKey
}: IProps) {
  const isDisabled = formRenderProps.field.disabled && fieldConfig.disabled;
  const isHidden = fieldConfig.hidden;
  const { handleSearch, ...restFieldFilterActions } = fieldFilterActions ?? {};

  //! FOR NOW DIRTY IMPLEMENTATION WILL BE HANDLE LATER
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   form.setValue(`${fieldConfig?.name}`, e.target.value, {
  //     shouldDirty: true,
  //     shouldValidate: true,
  //     shouldTouch: true,
  //   });
  // };
  if (isHidden) {
    return null;
  }

  return (
    <FormItem>
      <FormLabel required={fieldConfig?.required} data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "-lbl")}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Input
          // onChange={handleChange}
          data-test-id={kebabCase(formKey +" "+ (fieldConfig.name) + "-inp")}
          readOnly={fieldConfig?.readonly ?? false}
          className={`${isDisabled && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}`}
          disabled={isDisabled}
          placeholder={fieldConfig?.placeholder}
          iconPlacement="left"
          Icon={icon}
          hasError={!!formRenderProps.fieldState.error}
          defaultValue={value}
          leftAddon={fieldConfig.inputLeftAddOns}
          rightAddon={fieldConfig.inputRightAddOns}
          {...formRenderProps.field}
          onChange={(e) => {
            formRenderProps.field.onChange(e.target.value);
            if(handleSearch){
              handleSearch(e.target.value);
            }
          }}
          {...(restFieldFilterActions ?? {})}
        />
      </FormControl>
      <FormMessage data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "-errmsg")}/>
      {/* <DevTool  control={form.control} /> */}
    </FormItem>
  );
}
