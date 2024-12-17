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
  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-${fieldConfig.name}-lbl`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <div className="relative group">
          <Input
            data-test-id={`${formKey}-${fieldConfig.name}-inp`}
            type={showPassword ? "text" : "password"}
            {...form.register(fieldConfig?.name)}
            readOnly={fieldConfig?.readonly ?? false}
            className={`${isDisabled && " border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100"}`}
            disabled={isDisabled}
            placeholder={fieldConfig?.placeholder}
            iconPlacement="left"
            Icon={icon}
            hasError={!!formRenderProps.fieldState.error}
            value={value}
          />
          <Button
            data-test-id={`${formKey}-${fieldConfig.name}-show-pwd-btn`}
            Icon={showPassword ? EyeIcon : EyeSlashIcon}
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 mr-4 h-full py-2 hidden group-hover:block hover:bg-transparent"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={formRenderProps?.field?.disabled}
          >
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
      </FormControl>
      <FormMessage
        data-test-id={`${formKey}-${fieldConfig.name}-err-msg`}
      />
    </FormItem>
  );
}
