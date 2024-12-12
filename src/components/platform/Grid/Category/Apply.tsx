"use client";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { useCategoryContext } from "./Provider";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "~/components/ui/form";
import FormInput from "../../FormBuilder/FormType/FormInput";
import { CreateTab } from "./forms/Actions/CreateTab";

const FormSchema = z.object({
  name: z.string().min(1),
});

export default function Apply() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
  });
  const { state } = useCategoryContext();
  const { filters, sorts } = state?.storeUnsaved ?? {};

  const handleSubmit = async (data: any) => {
    await CreateTab({
      filters: filters?.values?.map((filter) => ({
        ...filter,
        values: Array.isArray(filter.values) ? filter.values : [filter.values],
      }))!,
      tabName: data?.name,
      sort_by_direction: sorts?.values?.sort_by_direction!,
      sort_by_field: sorts?.values?.sort_by_field!,
    });
  };

  return (
    <div className="flex max-w-7xl items-center justify-between p-2 sm:px-4 lg:px-6">
      <div className="flex flex-col gap-y-6">
        <Form {...form}>
          <form>
            <div className="mb-4 flex flex-row gap-x-2">
              <Button
                type="submit"
                onClick={form.handleSubmit(handleSubmit)}
                className="border-blue-500 text-blue-500"
                variant={"outline"}
              >
                <PlusIcon className="mr-1 h-5 w-5" /> Create Tab
              </Button>
              <Button
                className="border-blue-500 text-blue-500"
                variant={"outline"}
              >
                <ArrowPathIcon className="mr-1 h-5 w-5" /> Update Tab
              </Button>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={(formProps) => {
                return (
                  <FormInput
                  formKey="Apply"
                    fieldConfig={{
                      id: "name",
                      name: "name",
                      label: "Tab Name",
                      required: true,
                      placeholder: "name",
                      type: "text",
                    }}
                    form={form}
                    formRenderProps={formProps}
                  />
                );
              }}
            />
          </form>
        </Form>

        {filters?.values?.length ? (
          <div className="flex flex-col gap-y-2">
            <span className="text-md text-tertiary-foreground">
              Filter by{" "}
              <span
                className={cn(
                  "rounded-md p-1 text-sm",
                  filters?.validated
                    ? "border border-green-500 bg-green-100 text-green-500"
                    : "border border-red-500 bg-red-100 text-red-500",
                )}
              >
                {filters?.validated ? "Valid" : "Not yet validate"}
              </span>
            </span>
            <Badge variant={"outline"}>
              {filters?.values?.map((filter, index) => {
                return (
                  <span className="text-md" key={index}>
                    {filter.field}{" "}
                    <span className="text-md font-normal">
                      <span className="text-md font-semibold text-blue-500">
                        &nbsp;
                        {` ${filter.operator} `}&nbsp;
                      </span>
                      &nbsp;
                      {`"${filter.values}"`}
                    </span>
                  </span>
                );
              })}

              <Button variant={"ghost"} className="ml-2 hover:opacity-60">
                <XIcon className="text-default/60 h-3 w-3" />
              </Button>
            </Badge>
          </div>
        ) : null}
        <div className="flex flex-col gap-y-2">
          <span className="text-md text-tertiary-foreground">
            Sort By{" "}
            <span
              className={cn(
                "rounded-md p-1 text-sm",
                sorts?.validated
                  ? "border border-green-500 bg-green-100 text-green-500"
                  : "border border-red-500 bg-red-100 text-red-500",
              )}
            >
              {sorts?.validated ? "Valid" : "Not yet validate"}
            </span>
          </span>
          <Badge variant={"outline"} className="flex self-start">
            <span className="text-md">
              {sorts?.values?.sort_by_field} ({sorts?.values?.sort_by_direction}
              )
            </span>
            <Button variant={"ghost"} className="ml-2 hover:opacity-60">
              <XIcon className="text-default/60 h-3 w-3" />
            </Button>
          </Badge>
        </div>
        {/* <div className="flex flex-col gap-y-2">
          <span className="text-xs text-tertiary-foreground">Group By</span>
        </div> */}
      </div>
    </div>
  );
}
