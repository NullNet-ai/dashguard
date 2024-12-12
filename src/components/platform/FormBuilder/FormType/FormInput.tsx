import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../type";
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
}

export default function FormInput({
  fieldConfig,
  formRenderProps,
  icon,
  value,
}: IProps) {
  const isDisabled = formRenderProps.field.disabled && fieldConfig.disabled;
  const isHidden = fieldConfig.hidden;

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
      <FormLabel required={fieldConfig?.required}>
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <Input
          // onChange={handleChange}
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
        />
      </FormControl>
      <FormMessage />
      {/* <DevTool  control={form.control} /> */}
    </FormItem>
  );
}

function UnitIconComponent() {
  return <span className="pr-4 text-muted-foreground">Unit</span>;
}
