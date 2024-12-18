import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import CurrencyInput, {
  type CurrencyInputOnChangeValues,
  type CurrencyInputProps,
} from "~/components/ui/currency-input";
import { type OptionType, type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any[]>>;
    fieldState: ControllerFieldState;
  };
  currencyInputOptions?: Record<string, OptionType[]>;

  form: UseFormReturn<Record<string, any>, any, undefined>;
  icon?: React.ElementType;
  value?: string;
  formKey: string;
}

export default function FormCurrencyInput({
  fieldConfig,
  formRenderProps,
  currencyInputOptions,
  form,
  formKey,
}: IProps) {
  // const isDisabled = formRenderProps.field.disabled && fieldConfig.disabled;
  const inputRef = useRef<HTMLInputElement>(null);

  const options =
    currencyInputOptions && currencyInputOptions[fieldConfig.name]
      ? currencyInputOptions[fieldConfig.name]
      : [
          {
            label: "USD",
            value: "$",
          },
          {
            label: "EUR",
            value: "£",
          },
          {
            label: "JPY",
            value: "¥",
          },
          {
            label: "GBP",
            value: "€",
          },
        ];

  const [selectedCurrency, setSelectedCurrency] = useState<{
    label: string;
    value: string;
  }>((options && options?.[0]) ?? { label: "USD", value: "$" });

  const [values, setValues] = useState<CurrencyInputOnChangeValues>({
    value: "0.00",
    float: 0.0,
    formatted: "0.00",
  });

  const handleOnValueChange: CurrencyInputProps["onValueChange"] = (
    input,
    _name,
    _values,
  ) => {
    // Remove any non-numeric characters to sanitize input
    const numericInput = input?.replace(/\D/g, "") || "";

    // Default to "0" if there's no input
    const sanitizedInput = numericInput || "0";

    // Shift decimal place two spaces for "ATM-like" behavior
    const paddedInput = sanitizedInput.padStart(3, "0"); // Ensure at least 3 characters
    const integerPart = paddedInput.slice(0, -2); // All but last two digits
    const decimalPart = paddedInput.slice(-2); // Last two digits

    const formattedValue = `${integerPart}.${decimalPart}`;
    const floatValue = parseFloat(formattedValue);

    const updatedValues = {
      value: formattedValue,
      float: floatValue,
      formatted: floatValue.toFixed(2),
    };

    setValues(updatedValues);

    // Update the form field value
    form.setValue(fieldConfig.name, {
      amount: floatValue,
      currency: selectedCurrency.label,
    });
  };

  const handleCurrencySelect = (value: string) => {
    const selectedOption = options?.[Number(value)];
    if (selectedOption) {
      setSelectedCurrency(selectedOption);

      // Get the current amount from the existing form value
      const currentValue = form.getValues(fieldConfig.name);
      const currentAmount = currentValue?.amount;

      // Update the form value with the current amount and new currency
      form.setValue(fieldConfig.name, {
        amount: currentAmount,
        currency: selectedOption.label,
      });
    }
  };
  const normalInputRef = useRef<HTMLInputElement>(null);
  const { register } = form;
  const error = form.formState.errors[fieldConfig.name];
  return (
    <FormItem>
      <FormLabel
        required={fieldConfig?.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig?.label}
      </FormLabel>
      <FormControl>
        <div className="flex border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
          <Input
            disabled={fieldConfig.disabled}
            readOnly={formRenderProps.field.disabled}
            containerClassName="opacity-0 pointer-events-none absolute right-0"
            ref={normalInputRef}
            onChange={(e) =>
              handleOnValueChange(e.target.value, fieldConfig.name, values)
            }
            value={values.value}
          />

          <CurrencyInput
            {...register(fieldConfig.name)}
            disabled={fieldConfig.disabled}
            readOnly={formRenderProps.field.disabled}
            data-test-id={`${formKey}-inp-${fieldConfig.name}`}
            ref={inputRef}
            placeholder="Currency"
            className="border-0 focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0"
            onValueChange={(value) => {
              handleOnValueChange(value, fieldConfig.name, values);
              if (normalInputRef.current) {
                normalInputRef.current.focus(); // Focus on normal input when currency input is clicked
              }
            }}
            // onFocus={() => normalInputRef.current?.focus()}
            value={formRenderProps.field.value ? values.value : "0.00"}
            step={1}
            prefix={selectedCurrency.value}
            decimalSeparator="."
            groupSeparator=","
            decimalsLimit={2}
          />
            <Select
            value={options
              ?.findIndex((option) => option.label === selectedCurrency.label)
              .toString()}
            onValueChange={(value) => handleCurrencySelect(value)}
            data-test-id={`${formKey}-sel-${fieldConfig.name}`}
            disabled={formRenderProps.field.disabled}
            >
            <SelectTrigger
              className="w-fit border-0 text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
              data-test-id={`${formKey}-trg-${fieldConfig.name}`}
            >
              <SelectValue
              placeholder="Unit"
              data-test-id={`${formKey}-sel-val-${fieldConfig.name}`}
              >
              {selectedCurrency.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent data-test-id={`${formKey}-cnt-${fieldConfig.name}`}>
              {options?.map((option, i) => (
              <SelectItem
                key={option.label}
                value={i.toString()}
                data-test-id={`${formKey}-sel-opt-${option.label}-${fieldConfig.name}`}
              >
                {option.label}
              </SelectItem>
              ))}
            </SelectContent>
            </Select>
        </div>
      </FormControl>

      {error &&
      "amount" in error &&
      error.amount &&
      typeof error.amount.message === "string" ? (
        <p
          className={cn("py-1 text-md font-medium text-destructive")}
          data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
        >
          {error.amount.message}
        </p>
      ) : (
        <FormMessage />
      )}
    </FormItem>
  );
}
