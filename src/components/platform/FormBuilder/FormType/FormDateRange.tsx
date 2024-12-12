import { CalendarIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { type IField } from "../type";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, DateRange>, string>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<
    Record<string, unknown>,
    unknown,
    undefined
  >;
}

export default function FormDateRange({
  fieldConfig,
  formRenderProps,
  form
}: IProps) {
  const {field} = formRenderProps;
  const {disabled,value,onChange} = field;
  const {description,label,required,name,disabled:isfieldConfigDisabled} = fieldConfig
  return (
    <FormItem>
      <FormLabel required={required}>
        {label}
      </FormLabel>
      <div className={cn("grid gap-2")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
            {...form.register(name)}
              disabled={disabled}
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "LLL dd, y")} -{" "}
                    {format(value.to, "LLL dd, y")}
                  </>
                ) : (
                  format(value.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              {...field}
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              disabled={disabled || isfieldConfigDisabled}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}
