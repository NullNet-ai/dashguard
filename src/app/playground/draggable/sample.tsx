"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GripVerticalIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "~/components/ui/sortable";

const taskSchema = z.object({
  tasks: z.array(
    z.object({
      name: z.string(),
      priority: z.string(),
    }),
  ),
});

type TaskSchema = z.infer<typeof taskSchema>;

export default function Draggable() {
  const taskForm = useForm<TaskSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      tasks: [
        {
          name: "Task 1",
          priority: "High",
        },
        {
          name: "Task 2",
          priority: "Medium",
        },
      ],
    },
  });

  const handleSave = async (values: any) => {
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

  const { fields, append, move , remove } = useFieldArray({
    control: taskForm.control,
    name: "tasks",
  });

  const formFields: { name: "name" | "priority"; label: string; component: ({ field }: any) => JSX.Element }[] = [
    {
      name: "name",
      label: "Task Name",
      component: ({ field }: any) => (
        <Input
          className="h-10 px-3"
          containerClassName=" "
          {...field}
        />
      ),
    },
    {
      name: "priority",
      label: "Priority",
      component: ({ field }: any) => (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger className="h-10 px-3">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <>
      <Card className="m-4">
        <Form {...taskForm}>
          <form
            onSubmit={taskForm.handleSubmit(handleSave)}
            className="flex w-full flex-col gap-4 p-10"
          >
            <Sortable
              value={fields}
              onMove={({ activeIndex, overIndex }) =>
                move(activeIndex, overIndex)
              }
            >
              <div className="flex w-full flex-col gap-2">
                {fields.map((field, index) => (
                  <SortableItem key={field.id} value={field.id} asChild>
                    <div className="grid grid-cols-[auto,1fr,1fr,auto] items-end gap-1">
                      <SortableDragHandle
                        variant="ghost"
                        size="icon"
                        className="mb-1 size-8 shrink-0 text-muted-foreground"
                      >
                        <GripVerticalIcon
                          className="size-6"
                          aria-hidden="true"
                        />
                      </SortableDragHandle>
                      
                      {formFields.map((formField) => (
                        <FormField
                          key={formField.name}
                          control={taskForm.control}
                          name={`tasks.${index}.${formField.name}`}
                          render={({ field: formControlField }) => (
                            <FormItem>
                              {index === 0 && <FormLabel>{formField.label}</FormLabel>}
                              <FormControl>
                                {formField.component({ field: formControlField })}
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}

                      <Button
                        type="button"
                        variant="softDestructive"
                        size="icon"
                        className="mb-1 size-6 shrink-0 rounded-full"
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
                ))}
                <Button
                  className="mr-auto ms-7 gap-1 text-md text-primary hover:bg-transparent hover:opacity-70"
                  variant={"ghost"}
                  onClick={() => append({ name: "", priority: "" })}
                >
                  <PlusIcon className="size-5" aria-hidden="true" />
                  Add Task
                </Button>
              </div>
            </Sortable>
          </form>
        </Form>
      </Card>

      <Toaster />
    </>
  );
}