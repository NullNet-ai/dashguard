import { useContext } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { ulid } from "ulid";
import { Button } from "~/components/ui/button";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { GridContext } from "../../Provider";
import { Label } from "~/components/ui/label";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useCategoryContext } from "../Provider";
import getHeaderValue from "~/lib/header-value";

export const EOperatorArray: string[] = [
  "equal",
  "not_equal",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "contains",
  "not_contains",
  "is_empty",
  "is_not_empty",
  "is_null",
  "is_not_null",
  "is_between",
  "is_not_between",
  "and",
  "or",
];

interface IProps {
  form: UseFormReturn;
}
export default function CustomFilterForm({ form }: IProps) {
  const { state } = useContext(GridContext);
  const { action } = useCategoryContext();
  const { register } = form;
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: "filters",
  });
  const addFilter = () => {
    const filters = form.getValues("filters");

    if (
      (filters ?? []).length === 0 ||
      filters?.[filters.length - 1]?.type === "operator"
    ) {
      append({
        id: ulid(),
        type: "criteria",
        field: "",
        operator: "",
        values: "",
      });
    } else if (filters[filters.length - 1]?.type === "criteria") {
      append({
        id: ulid(),
        type: "operator",
        field: "",
        operator: "",
        values: "",
      });
    }
    const newAdded = form.getValues("filters");
    action?.handleStoreUnSavedFilters(state?.config?.entity!, false, newAdded);
  };

  const handleChange = (index: number, name: string, value: string) => {
    form.setValue(`filters[${index}].${name}`, value);
  };

  const removeFilter = (index: number) => {
    remove(index);
    const filters = form.getValues("filters");
    action?.handleStoreUnSavedFilters(state?.config?.entity!, false, filters);
  };

  return (
    <div>
      <FormField
        name="filters"
        control={form.control}
        render={(formProps) => {
          const errorMessage = formProps?.fieldState?.error as {
            [key: string]: any;
          };
          return (
            <FormItem className="h-[700px] overflow-y-auto">
              {fields.map((field, index) => {
                return (
                  <div key={index} className="flex w-max items-center">
                    <div className="flex flex-1 items-center gap-2 space-x-2 rounded-md bg-tertiary p-2">
                      <div className="w-[270px]">
                        <Label
                          className={cn(
                            errorMessage?.[index] && "text-destructive",
                            `after:ml-0.5 after:text-destructive after:content-["*"]`,
                          )}
                        >
                          Type
                        </Label>
                        <Input
                          {...register(`filters.${index}.type` as const)}
                          placeholder="Type"
                          onChange={(e) => {
                            handleChange(index, "type", e.target.value);
                          }}
                          disabled
                        />
                        {errorMessage?.[index] && (
                          <p
                            className={cn(
                              "py-1 text-sm font-medium text-destructive",
                            )}
                          >
                            {errorMessage?.[index]?.filters?.message}
                          </p>
                        )}
                      </div>

                      {formProps?.field?.value?.[index]?.type === "criteria" ? (
                        <div className="w-[270px]">
                          <Label
                            className={cn(
                              errorMessage?.[index] && "text-destructive",
                              `after:ml-0.5 after:text-destructive after:content-["*"]`,
                            )}
                          >
                            Field
                          </Label>
                          <Select
                            {...register(`filters.${index}.field` as const)}
                            onValueChange={(value) => {
                              handleChange(index, "field", value);
                            }}
                            defaultValue={
                              formProps?.field?.value?.[index]?.field
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={"Field"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {state?.table
                                .getAllLeafColumns()
                                .map((column, index) => (
                                  <SelectItem key={index} value={column?.id}>
                                    {getHeaderValue(column)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {errorMessage?.[index] && (
                            <p
                              className={cn(
                                "py-1 text-sm font-medium text-destructive",
                              )}
                            >
                              {errorMessage?.[index]?.filters?.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="w-[270px]"></div>
                      )}
                      <div className="w-[270px]">
                        <Label
                          className={cn(
                            errorMessage?.[index] && "text-destructive",
                            `after:ml-0.5 after:text-destructive after:content-["*"]`,
                          )}
                        >
                          Operator
                        </Label>
                        <Select
                          {...register(`filters.${index}.operator` as const)}
                          onValueChange={(value) => {
                            handleChange(index, "operator", value);
                          }}
                          defaultValue={
                            formProps?.field?.value?.[index]?.operator
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={"Operator"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EOperatorArray?.filter((column) => {
                              const type =
                                formProps?.field?.value?.[index]?.type;
                              if (type === "operator") {
                                // Only Or and  And operator can be used for criteria
                                return column === "or" || column === "and";
                              }
                              return true;
                            }).map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errorMessage?.[index] && (
                          <p
                            className={cn(
                              "py-1 text-sm font-medium text-destructive",
                            )}
                          >
                            {errorMessage?.[index]?.filters?.message}
                          </p>
                        )}
                      </div>
                      {formProps?.field?.value?.[index]?.type === "criteria" ? (
                        <div className="w-[270px]">
                          <Label
                            className={cn(
                              errorMessage?.[index] && "text-destructive",
                              `after:ml-0.5 after:text-destructive after:content-["*"]`,
                            )}
                          >
                            Values
                          </Label>
                          <Input
                            {...register(`filters.${index}.values` as const)}
                            placeholder="Values"
                            onChange={(e) => {
                              handleChange(index, "values", e.target.value);
                            }}
                          />
                          {errorMessage?.[index] && (
                            <p
                              className={cn(
                                "py-1 text-sm font-medium text-destructive",
                              )}
                            >
                              {errorMessage?.[index]?.filters?.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="w-[270px]"></div>
                      )}
                    </div>
                    <div>
                      {index !== fields.length - 1 || index === 0 ? null : (
                        <Button
                          onClick={() => {
                            removeFilter(index);
                          }}
                          variant={"ghost"}
                          className="text-red-500"
                        >
                          <TrashIcon className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </FormItem>
          );
        }}
      />
      <div className="flex justify-end">
        <Button
          className="text-md text-primary"
          variant={"ghost"}
          type="button"
          onClick={addFilter}
        >
          + Add Filter
        </Button>
      </div>
    </div>
  );
}
