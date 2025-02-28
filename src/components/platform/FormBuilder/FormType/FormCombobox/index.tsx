'use client'
import * as React from "react";
import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { type UseFormReturn, type ControllerFieldState, type ControllerRenderProps } from "react-hook-form";
import { ComboBox } from '~/components/ui/combobox';
import { type IField } from '../../types/global/interfaces';

interface FormComboBoxProps {
    fieldConfig: IField;
    formRenderProps: {
        field: ControllerRenderProps<Record<string, any[]>>;
        fieldState: ControllerFieldState;
    };
    form: UseFormReturn<Record<string, any>, any, undefined>;
    formKey: string;
}

export default function FormComboBox({
    fieldConfig,
    formRenderProps,
    formKey,
}: FormComboBoxProps) {
    const isHidden = fieldConfig.hidden;
    const options = React.useMemo(() => fieldConfig.comboboxConfig?.selectOptions || [], [fieldConfig.comboboxConfig]);

    // Parse the combined value into select and input parts
    const parseCombinedValue = React.useCallback((combinedValue: string | undefined = '') => {
        if (!combinedValue) return { selectValue: '', inputValue: '' };

        // Convert to string if it's an array
        const valueStr = Array.isArray(combinedValue) ? combinedValue.join('') : String(combinedValue);

        // Find which select option prefix matches the combined value
        const selectedOption = options.find((option: { value: string; }) =>
            valueStr.startsWith(option.value)
        );

        if (selectedOption) {
            return {
                selectValue: selectedOption.value,
                inputValue: valueStr.substring(selectedOption.value.length)
            };
        }

        // Default if no match found
        return {
            selectValue: options.length > 0 ? options?.[0]?.value : '',
            inputValue: valueStr
        };
    }, [options]);

    // Parse the form value whenever it changes
    const { selectValue, inputValue } = parseCombinedValue(Array.isArray(formRenderProps.field.value) ? formRenderProps.field.value.join('') : formRenderProps.field.value);

    // Handle combined value changes
    const handleCombinedChange = (combinedValue: string) => {
        formRenderProps.field.onChange(combinedValue);
        
        // Call the onValueParsed callback if provided
        if (comboboxConfig?.onValueParsed) {
            const parsedValues = parseCombinedValue(combinedValue);
            // Ensure selectValue is always a string to match ValueProps type
            comboboxConfig.onValueParsed({
                selectValue: parsedValues.selectValue || '',
                inputValue: parsedValues.inputValue
            });
        }
    };

    // Expose the current parsed values to the parent via callback
    React.useEffect(() => {
        if (comboboxConfig?.onValueParsed) {
            comboboxConfig.onValueParsed({
                selectValue: selectValue || '',
                inputValue: inputValue || ''
            });
        }
    }, [selectValue, inputValue]);

    if (isHidden) {
        return null;
    }

    const { comboboxConfig } = fieldConfig;

    return (
        <FormItem>
            <FormLabel
                required={fieldConfig?.required}
                data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
            >
                {fieldConfig?.label}
            </FormLabel>
            <FormControl>
                <ComboBox
                    selectOptions={options}
                    inputPlaceholder={comboboxConfig?.inputPlaceholder || fieldConfig?.placeholder}
                    selectPlaceholder={comboboxConfig?.selectPlaceholder}
                    className={comboboxConfig?.className}
                    selectValue={selectValue}
                    inputValue={inputValue}
                    onCombinedChange={comboboxConfig?.onCombinedChange || handleCombinedChange}
                    disabled={fieldConfig?.disabled}
                    readonly={((formRenderProps.field.disabled || fieldConfig?.readonly) ??
                        false)}
                />
            </FormControl>
            <FormMessage
                data-test-id={`${formKey}-err-msg-${fieldConfig.name}`}
                detail={fieldConfig.detail}
            />
        </FormItem>
    );
}