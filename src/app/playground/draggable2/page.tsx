"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GripVerticalIcon, MinusIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { ButtonWithDropdown } from "~/components/platform/ButtonWithDropdown";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "~/components/ui/sortable";

const schema = z.object({
  flipTricks: z.array(
    z.object({
      name: z.string(),
      spin: z.string(),
    }),
  ),
});

type Schema = z.infer<typeof schema>;

export default function VerticalSortingDemo() {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      flipTricks: [
        {
          spin: "360",
          name: "Input Label 1",
        },
        {
          spin: "180",
          name: "Input Label 2",
        },
      ],
    },
  });

  const handleSave = async (values: z.infer<typeof schema>) => {
    return new Promise<void>((resolve, reject) => {
      try {
        toast(
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(values, null, 2)}
            </code>
          </pre>,
        );
        resolve();
      } catch (error) {
        console.error("Form submission error", error);
        toast.error("Failed to submit the form. Please try again.");
        reject(new Error("Form submission error"));
      }
    });
  };

  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "flipTricks",
  });

  return (
    <div className="p-4">
      <Form {...form}>
        <ButtonWithDropdown
          entity={"test"}
          buttonClassName=""
          buttonVariant={"default"}
          buttonLabel={"Add"}
          dropdownOptions={[
            {
              label: "Test Label",
              onClick: () => {
                append({ name: "Input Label 1", spin: "" });
              },
            },
            {
              label: "Test Label 2",
              onClick: () => {
                append({ name: "Input Label 2", spin: "" });
              },
            },
          ]}
          // disabled={
          //   saveContinueLoading || saveCloseLoading || saveNewLoading
          // }
          // loading={saveContinueLoading} // Pass the loading state for the main button
        />
        <div className="border-b border-b-primary p-2 border-t border-t-default-100 mt-2">
          <FormLabel className="">Group Label</FormLabel>
        </div>
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="flex w-full flex-col gap-4"
        >
          <Sortable
            value={fields}
            onMove={({ activeIndex, overIndex }) =>
              move(activeIndex, overIndex)
            }
          >
            <div className="flex w-full flex-col">
              {fields.map((field, index) => (
                <>
                  <SortableItem key={field.id} value={field.id} asChild>
                    <div className="border-default-100 flex flex-row items-center gap-2 border-b py-2">
                      <SortableDragHandle
                        variant="link"
                        size="icon"
                        className="size-8 shrink-0 text-default/60"
                      >
                        <GripVerticalIcon
                          className="size-4"
                          aria-hidden="true"
                        />
                      </SortableDragHandle>
                      <div className="min-w-[150px]">
                        <FormLabel className="font-normal">{field?.name}</FormLabel>
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`flipTricks.${index}.spin`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="h-8"
                                  containerClassName="!mt-0 w-full"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="softDestructive"
                        size="icon"
                        className="mb-2 size-6 shrink-0 rounded-full"
                        onClick={() => remove(index)}
                      >
                        <MinusIcon
                          className="size-4 text-destructive"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </SortableItem>
                </>
              ))}
            </div>
          </Sortable>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}