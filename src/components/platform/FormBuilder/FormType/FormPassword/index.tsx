import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../../types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
}

export default function FormPassword({
  fieldConfig,
  formRenderProps,
  icon,
  form,
  value,
  formKey,
}: IProps) {
  const isDisabled = formRenderProps.field.disabled;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <div className="group relative">
          <Input
            data-test-id={`${formKey}-inp-${fieldConfig.name}`}
            type={showPassword ? "text" : "password"}
            {...form.register(fieldConfig?.name)}
            readOnly={
              (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
            }
            disabled={fieldConfig.disabled}
            placeholder={fieldConfig?.placeholder}
            iconPlacement="left"
            Icon={icon}
            hasError={!!formRenderProps.fieldState.error}
            value={value}
          />
          <Button
            data-test-id={`${formKey}-show-pwd-btn-${fieldConfig.name}`}
            Icon={showPassword ? EyeIcon : EyeSlashIcon}
            type="button"
            variant="ghost"
            size="sm"
            className={`absolute right-0 top-0 mr-4 hidden h-full py-2 hover:bg-transparent ${isDisabled ? "":"group-hover:block"}`}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={formRenderProps?.field?.disabled}
          >
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
