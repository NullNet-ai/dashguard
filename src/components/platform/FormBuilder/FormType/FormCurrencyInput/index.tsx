import { useEffect, useRef, useState } from "react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";
import CurrencyInput, {
  type CurrencyInputOnChangeValues,
} from "~/components/ui/currency-input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { type IField, type OptionType } from "../../types";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const defaultValues = form.watch(fieldConfig.name);

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
    value: defaultValues?.amount || "0.00",
    float: defaultValues?.amount || 0.0,
    formatted: defaultValues?.amount?.toFixed(2) || "0.00",
  });

  const [isDeleted, setIsDeleted] = useState(false);
  const lastCursorPosition = useRef<number | null>(null);

  useEffect(() => {
    if (defaultValues?.amount !== undefined) {
      const newValue = defaultValues.amount.toFixed(2);
      setValues({
        value: newValue,
        float: defaultValues.amount,
        formatted: newValue,
      });
    }
  }, [defaultValues]);

  const formatValue = (numericValue: string) => {
    if (!numericValue) return "0.00";

    // Remove any non-numeric characters
    const cleanValue = numericValue.replace(/[^\d]/g, "");

    // Ensure we have at least 3 digits (including 2 decimal places)
    const paddedValue = cleanValue.padStart(3, "0");

    // Split into integer and decimal parts
    const integerPart = paddedValue.slice(0, -2) || "0";
    const decimalPart = paddedValue.slice(-2);

    return `${integerPart}.${decimalPart}`;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorStart = input.selectionStart ?? 0;

    // Store the cursor position for later use
    lastCursorPosition.current = cursorStart;

    const newInput = e.target.value.replace(selectedCurrency.value, "");

    // If backspace was used to clear the input
    if (newInput === "") {
      setIsDeleted(true);
      const updatedValues = {
        value: "0.00",
        float: 0,
        formatted: "0.00",
      };
      setValues(updatedValues);
      form.setValue(
        fieldConfig.name,
        {
          amount: 0,
          currency: selectedCurrency.label,
        },
        {
          shouldDirty: true,
        },
      );
      return;
    }

    // Only process if not in deleted state or if new input is detected
    if (!isDeleted || newInput !== values.value) {
      setIsDeleted(false);

      const formattedValue = formatValue(newInput);
      const floatValue = parseFloat(formattedValue);

      const updatedValues = {
        value: formattedValue,
        float: floatValue,
        formatted: floatValue.toFixed(2),
      };

      setValues(updatedValues);
      form.setValue(
        fieldConfig.name,
        {
          amount: floatValue,
          currency: selectedCurrency.label,
        },
        {
          shouldDirty: true,
        },
      );

      // Restore cursor position after React updates the DOM
      setTimeout(() => {
        if (inputRef.current && lastCursorPosition.current !== null) {
          const newPosition = Math.min(
            lastCursorPosition.current,
            formattedValue.length + selectedCurrency.value.length,
          );
          inputRef.current.selectionStart = newPosition;
          inputRef.current.selectionEnd = newPosition;
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
      const cursorPosition = e.target.selectionStart ?? 0;

      // Handle backspace with text selection
      if (e.key === "Backspace" && hasSelection) {
        e.preventDefault();
        setIsDeleted(true);
        const updatedValues = {
          value: "0.00",
          float: 0,
          formatted: "0.00",
        };
        setValues(updatedValues);
        form.setValue(
          fieldConfig.name,
          {
            amount: 0,
            currency: selectedCurrency.label,
          },
          {
            shouldDirty: true,
          },
        );
      }
      // Handle regular backspace
      else if (e.key === "Backspace") {
        lastCursorPosition.current = cursorPosition - 1;
      }
      // For any other key press
      else {
        lastCursorPosition.current = cursorPosition;
      }
    }
  };

  const handleCurrencySelect = (value: string) => {
    const selectedOption = options?.[Number(value)];
    if (selectedOption) {
      setSelectedCurrency(selectedOption);

      const currentValue = form.getValues(fieldConfig.name);
      const currentAmount = currentValue?.amount;

      form.setValue(
        fieldConfig.name,
        {
          amount: currentAmount,
          currency: selectedOption.label,
        },
        {
          shouldDirty: true,
        },
      );
    }
  };

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
        <div
          className={cn(
            "flex  rounded-md border focus-within:ring-1 focus-within:border-primary focus-within:ring-ring",
            error ? "border-destructive " : "",
            fieldConfig.disabled && "bg-secondary"
          )}
        >
          <CurrencyInput
            {...register(fieldConfig.name)}
            disabled={fieldConfig.disabled}
            readOnly={
              (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
            }
            data-test-id={`${formKey}-inp-${fieldConfig.name}`}
            ref={inputRef}
            placeholder="Currency"
            className="border-0 py-0 focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-within:ring-0"
            onChange={handleValueChange}
            onKeyDown={handleKeyDown}
            value={values.value}
            prefix={selectedCurrency.value}
            decimalSeparator="."
            groupSeparator=","
            decimalsLimit={2}
          />
          <Select
            value={options
              ?.findIndex((option) => option.label === selectedCurrency.label)
              .toString()}
            onValueChange={handleCurrencySelect}
            data-test-id={`${formKey}-sel-${fieldConfig.name}`}
            disabled={formRenderProps.field.disabled || fieldConfig.readonly}
          >
            <SelectTrigger
              className={cn("h-[36px] disabled:bg-transparent w-fit border-0 py-0 text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0",
              )}
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
      {/* <DevTool control={form.control} /> */}

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
