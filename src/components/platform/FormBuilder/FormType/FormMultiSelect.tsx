/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import MultipleSelector, { type Option } from "~/components/ui/multi-select";
import { type IField } from "../type";
import kebabCase from "lodash/kebabCase";
import capitalize from "lodash/capitalize";
;

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

  const isDisabled = formRenderProps.field.disabled || fieldConfig.disabled;
  const isAlphabeticalSorting = fieldConfig.isMultiSelectAlphabetical ?? true;
  return (
    <FormItem className="overflow-visible">
      <FormLabel required={fieldConfig.required}  data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "MultipleSelectFormLabel")}>{fieldConfig.label}</FormLabel>
      <FormControl>
        <MultipleSelector
          {...register((fieldConfig.name))}
          {...formRenderProps.field}
          data-test-id={kebabCase(
            formKey + " "+ (fieldConfig.name) + "MultipleSelector",
          )}
          disabled={isDisabled}
          className={
            !!formRenderProps?.fieldState.error
              ? "border-destructive"
              : "border border-input outline-offset-2 ring-ring ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring"
          }
          inputProps={{
            // @ts-expect-error - Not able to pass data-test-id on types
            "data-test-id": kebabCase(`${formKey+(fieldConfig.name)}MultipleSelectorInput`),
            "data-selected-value": kebabCase(`${formKey+formRenderProps?.field?.value?.map((item: { value: string }) => item.value).join(",")}`),
            className: `flex w-full rounded-md border  bg-background px-4 text-md  file:border-0 file:bg-transparent file:text-md file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-md/6 outline-none ring-0 border-0 focus:ring-transparent  ${isDisabled && "border-transparent placeholder:text-muted-foreground disabled:text-foreground disabled:opacity-100 "} `,
          }}
          onSearch={multiSelectOnSearch?.[(fieldConfig.name)]}
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
          creatable={!multiSelectOnSearch && !multiselectOptions && true}
          triggerSearchOnFocus={
            fieldConfig.multiSelectTriggerSearchOnFocus ?? false
          }
          defaultOptions={
            isAlphabeticalSorting
              ? multiselectOptions?.[fieldConfig?.name]?.sort((a, b) =>
                  a.label.localeCompare(b.label),
                )
              : multiselectOptions?.[fieldConfig?.name]
          }
          options={
            isAlphabeticalSorting
              ? multiselectOptions?.[fieldConfig?.name]?.sort((a, b) =>
                  a.label.localeCompare(b.label),
                )
              : multiselectOptions?.[fieldConfig?.name]
          }
          placeholder={fieldConfig.placeholder}
          hideClearAllButton={
            fieldConfig.multiSelectHideClearAllButton ??
            fieldConfig.multiSelectMaxSelected === 1
          }
        />
      </FormControl>
      <FormMessage  data-test-id={kebabCase(formKey + " "+ (fieldConfig.name) + "MultipleSelectErrorMessage")}/>

    </FormItem>
  );
}
