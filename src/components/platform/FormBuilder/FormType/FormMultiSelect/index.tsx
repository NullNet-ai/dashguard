/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type UseFormReturn,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import MultipleSelector, { type Option } from "~/components/ui/multi-select";
import { useToast } from "~/context/ToastProvider";
import { createRecord } from "../../Actions/CreateRecord";
import { type IField } from "../../types";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, any>, string>;
    fieldState: ControllerFieldState;
  };
  multiselectOptions: Record<string, Option[]> | undefined;
  multiSelectOnSearch?: Record<string, (search: string) => Promise<Option[]>>;
  form: UseFormReturn<
    {
      [x: string]: any;
    },
    any,
    undefined
  >;
  formKey: string;
}

export default function FormMultiSelect({
  fieldConfig,
  formRenderProps,
  multiselectOptions,
  multiSelectOnSearch,
  form,
  formKey,
}: IProps) {
  const { register } = form;
  const toast = useToast();
  const isDisabled = formRenderProps.field.disabled;
  const isAlphabeticalSorting = fieldConfig.isMultiSelectAlphabetical ?? true;

  const createNewRecord = async (query: string) => {
    if (!fieldConfig?.selectOnCreateRecord) {
      toast.error("selectOnCreateRecord is not defined in fieldConfig");
      return
    }
    if (fieldConfig?.selectOnCreateValidate) {
      const validation = await fieldConfig?.selectOnCreateValidate(query);
      if (!validation?.valid) {
        toast.error(validation?.message || "Invalid Input");
        return;
      }
    }
    let createdData = null;
    if (typeof fieldConfig?.selectOnCreateRecord === "function") {
      createdData = await fieldConfig?.selectOnCreateRecord(query);
    } else {
      const { entity, fieldIdentifier, customParams } =
        fieldConfig?.selectOnCreateRecord ?? {};
      createdData = await createRecord({
        entity,
        fieldIdentifier,
        data: {
          ...(customParams ?? {}),
          [fieldIdentifier]: query,
        },
      });
    }
    return createdData as Option;
  };

  return (
    <FormItem className="overflow-visible">
      <FormLabel
        required={fieldConfig.required}
        data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
      >
        {fieldConfig.label}
      </FormLabel>
      <FormControl>
        <MultipleSelector
          {...register(fieldConfig.name)}
          {...formRenderProps.field}
          readOnly={
            (formRenderProps.field.disabled || fieldConfig?.readonly) ?? false
          }
          data-test-id={`${formKey}-msel-${fieldConfig.name}`}
          disabled={fieldConfig.disabled || isDisabled}
          className={
            formRenderProps?.fieldState.error
              ? "border-destructive"
              : "flex items-center border border-input py-0 outline-offset-2 ring-ring ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
          }
          inputProps={{
            // @ts-expect-error - Not able to pass data-test-id on types
            "data-test-id": `${formKey}-inp-${fieldConfig.name}`,
            "data-selected-value": `${formKey}-${formRenderProps?.field?.value?.map((item: { value: string }) => item.value).join(",")}`,
            className: `flex w-full rounded-md border bg-background px-2 py-0 text-md file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-md/6 outline-none ring-0 border-0 focus:ring-transparent ${isDisabled && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100 "}`,
          }}
          onSearch={multiSelectOnSearch?.[fieldConfig.name]}
          loadingIndicator={
            fieldConfig.multiSelectLoadingIndicator ?? (
              <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                loading...
              </p>
            )
          }
          emptyIndicator={fieldConfig.multiSelectEmptyIndicator ?? undefined}
          onMaxSelected={fieldConfig.multiSelectOnMaxSelected ?? undefined}
          maxSelected={fieldConfig.multiSelectMaxSelected ?? undefined}
          delay={fieldConfig.multiSelectDelay ?? 500}
          hidePlaceholderWhenSelected={
            fieldConfig.multiSelectHidePlaceholderWhenSelected ?? false
          }
          creatable={fieldConfig.selectEnableCreate ?? false}
          triggerSearchOnFocus={
            fieldConfig.multiSelectTriggerSearchOnFocus ?? false
          }
          defaultOptions={
            isAlphabeticalSorting
              ? multiselectOptions?.[fieldConfig.name]?.sort((a, b) =>
                  a.label?.localeCompare(b.label),
                )
              : multiselectOptions?.[fieldConfig.name]
          }
          options={
            isAlphabeticalSorting
              ? multiselectOptions?.[fieldConfig.name]?.sort((a, b) =>
                  a.label?.localeCompare(b.label),
                )
              : multiselectOptions?.[fieldConfig.name]
          }
          placeholder={fieldConfig.placeholder}
          hideClearAllButton={
            fieldConfig.multiSelectHideClearAllButton ??
            fieldConfig.multiSelectMaxSelected === 1
          }
          onCreateRecord={createNewRecord}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}
