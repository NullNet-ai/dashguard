import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {type IFieldFilterActions,  type IField } from "../../types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";


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
  const isDisabled =  formRenderProps.field.disabled
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
      <FormLabel required={fieldConfig?.required} data-test-id={`${formKey}-lbl-${fieldConfig.name}`}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Input
          // onChange={handleChange}
          data-test-id={`${formKey}-inp-${fieldConfig.name}`}
          placeholder={fieldConfig?.placeholder}
          iconPlacement="left"
          Icon={icon}
          autoComplete="off"
          hasError={!!formRenderProps.fieldState.error}
          defaultValue={value}
          leftAddon={fieldConfig.inputLeftAddOns}
          rightAddon={fieldConfig.inputRightAddOns}
          readOnly={(formRenderProps.field.disabled || fieldConfig?.readonly) ?? false}
          {...formRenderProps.field}
          disabled={fieldConfig.disabled}
          onChange={(e) => {
            formRenderProps.field.onChange(e.target.value);
            if(handleSearch){
              handleSearch(e.target.value);
            }
          }}
          {...(restFieldFilterActions ?? {})}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} detail={fieldConfig.detail} />
      {/* <DevTool  control={form.control} /> */}
    </FormItem>
  );
}
