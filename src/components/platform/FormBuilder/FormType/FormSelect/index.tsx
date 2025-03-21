import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "~/components/ui/form";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/context/ToastProvider";
import { formatFormTestID } from "~/lib/utils";
import { ComboSelect, type ComboSelectOption } from "~/components/ui/combo-select";

import { createRecord } from "../../Actions/CreateRecord";
import { type IField, type ISelectOptions } from "../../types";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  selectOptions: Record<string, ISelectOptions[]> | undefined;
  form: UseFormReturn<Record<string, any>, any, undefined>;
  pillOptions?: any[];
  formKey: string;
}

export default function FormSelect({
  fieldConfig,
  formRenderProps,
  selectOptions,
  pillOptions,
  formKey,
  form,
}: IProps) {
  form.watch(fieldConfig?.name);
  const toast = useToast();
  const { error } = useFormField();

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ISelectOptions[]>(
    selectOptions?.[fieldConfig?.name] ?? [],
  );
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  
  const isDisabled = fieldConfig.disabled ?? false;
  const isReadOnly = fieldConfig.isCustomFormField
    ? fieldConfig.readonly
    : formRenderProps.field.disabled || fieldConfig.readonly;

  const SelectIcon = fieldConfig.selectIcon;

  // Helper function to sort options
  const sortOptions = useCallback((opts: ISelectOptions[]) => {
    const isNumeric = (str: string) => {
      if (typeof str !== "string") return false;
      return !isNaN(parseFloat(str)) && isFinite(Number(str));
    };

    return [...opts].sort((a, b) => {
      // Check if both values are numeric strings
      if (isNumeric(a.value) && isNumeric(b.value)) {
        return Number(a.value) - Number(b.value);
      }
      // Fall back to alphabetical sorting if not numeric
      return a.label?.localeCompare(b.label) ?? 0;
    });
  }, []);

  useEffect(() => {
    setOptions(selectOptions?.[fieldConfig?.name] ?? []);
  }, [selectOptions, fieldConfig?.name]);

  // Convert ISelectOptions to ComboSelectOption
  const comboOptions: ComboSelectOption[] = useMemo(() => {
    return options.map(opt => ({
      label: opt.label,
      value: opt.value,
      // Add any additional mappings needed
    }));
  }, [options]);

  // Find the selected value
  const selectedValue = useMemo(() => {
    const selectedOption = options?.find((opt) => opt.value === formRenderProps?.field.value);
    return selectedOption ? {
      label: selectedOption.label,
      value: selectedOption.value,
      // Add any additional properties needed for ComboSelectOption
    } : null;
  }, [formRenderProps?.field.value, options]);

  const createNewRecord = async () => {
    if (!fieldConfig?.selectOnCreateRecord) {
      toast.error("selectOnCreateRecord is not defined in fieldConfig");
      return;
    }
    if (fieldConfig?.selectOnCreateValidate) {
      const validation = await fieldConfig?.selectOnCreateValidate(query);
      if (!validation?.valid) {
        toast.error(validation?.message || "Invalid Input");
        return;
      }
    }
    setIsCreateLoading(true);
    let createdData = null;
    if (typeof fieldConfig?.selectOnCreateRecord === "function") {
      createdData = await fieldConfig?.selectOnCreateRecord(query);
    } else {
      const { entity, fieldIdentifier, customParams } =
        fieldConfig?.selectOnCreateRecord ?? {};
      createdData = (await createRecord({
        entity,
        fieldIdentifier,
        data: {
          ...(customParams ?? {}),
          [fieldIdentifier]: query,
        },
      })) as ISelectOptions;
    }
    setOptions(sortOptions([...(options ?? []), createdData]));
    formRenderProps?.field.onChange(createdData?.value || "");
    setIsCreateLoading(false);
  };

  const isOptionsExist = options?.find(p => p.label?.toLowerCase() === query?.trim().toLowerCase());

  // Create custom render functions for ComboSelect
  const renderCreateOption = fieldConfig?.selectEnableCreate && query && !isOptionsExist ? (
    <button
      className="block cursor-pointer truncate bg-primary/10 px-3 py-2 font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
      data-test-id={`${formKey}-opt-create-new-${fieldConfig.name}`}
      onClick={createNewRecord}
    >
      {isCreateLoading ? "Creating..." : `Create "${query}"`}
    </button>
  ) : null;

  const renderEmptyState = !fieldConfig?.selectEnableCreate ? (
    <span
      className="ms-3 p-2 ps-0 text-sm text-foreground block truncate group-data-[selected]:font-semibold"
      data-test-id={`${formKey}-opt-not-found-${fieldConfig.name}`}
    >
      {fieldConfig?.label ? `No ${fieldConfig.label} found.` : "No options found."}
    </span>
  ) : null;

  return (
    <FormItem>
      <div>
        <FormLabel
          required={fieldConfig?.required}
          data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
        >
          {fieldConfig?.label}
        </FormLabel>
        {pillOptions?.length ? (
          <>
            {pillOptions.map((option, index) => (
              <Badge
                data-test-id={`${formKey}-opt-${option}-${fieldConfig.name}`}
                key={index}
                className="mx-2 border border-success bg-success/10 text-success"
              >
                {option}
              </Badge>
            ))}
          </>
        ) : null}
      </div>
      
      <ComboSelect
        options={comboOptions}
        value={selectedValue}
        onChange={(newValue) => {
          formRenderProps?.field?.onChange(newValue?.value || "");
        }}
        placeholder={fieldConfig.placeholder}
        disabled={isDisabled}
        readOnly={isReadOnly}
        searchable={fieldConfig.selectSearchable !== false}
        icon={SelectIcon}
        className="w-full"
        error={!!error}
        showCheckmarks={fieldConfig.selectConfig?.showCheckmarks !== false}
        checkmarkPosition={fieldConfig.selectConfig?.checkmarkPosition || 'right'}
        showStatus={fieldConfig.selectConfig?.showStatus || false}
        showAvatars={fieldConfig.selectConfig?.showAvatars || false}
        avatarSize={fieldConfig.selectConfig?.avatarSize || "xs"}
        renderCreateOption={renderCreateOption}
        renderEmptyState={renderEmptyState}
        onQueryChange={setQuery}
        testId={formatFormTestID(`${formKey}-select-${fieldConfig.name}`)}
        infiniteScroll={fieldConfig.selectConfig?.infiniteScroll ? {
          enabled: true,
          initialLimit: fieldConfig.selectConfig?.infiniteScroll.initialLimit || 50,
          loadMoreStep: fieldConfig.selectConfig?.infiniteScroll.loadMoreStep || 50,
          hasMore: fieldConfig.selectConfig?.infiniteScroll.hasMore !== false,
          loadingIndicator: fieldConfig.selectConfig?.infiniteScroll.loadingIndicator || (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Loading more options...
            </div>
          )
        } : undefined}
      />

      <FormMessage className='text-md' data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
