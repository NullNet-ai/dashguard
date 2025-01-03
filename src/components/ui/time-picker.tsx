
import { ClockIcon } from "lucide-react";
import React from "react";
import { useTimescape } from "timescape/react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

const timePickerInputBase =
  "p-1 inline tabular-nums h-fit border-none outline-none select-none content-box caret-transparent rounded-md min-w-8 text-center focus:text-primary-foreground focus:bg-primary focus:placeholder:text-primary-foreground  focus-visible:ring-0 focus-visible:outline-none opacity-0 transition-opacity duration-200";
const timePickerSeparatorBase =
  "text-xs text-foreground opacity-0 transition-opacity duration-200 font-bold";

export interface TimePickerProps {
  value?: Date ;
  onChange?: (date: Date | undefined) => void;
  is24Hour?: boolean;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
}

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({ value, onChange, is24Hour = false, className }, ref) => {

    const timescape = useTimescape({
      date: value || undefined,
      hour12: !is24Hour,
      onChangeDate: onChange,
      digits: "2-digit",
    });

    const { options } = timescape;


    return (
      <div
        {...timescape.getRootProps()}
        ref={ref}
        className={cn(`flex ${!options.hour12 ? 'w-44' : 'w-44'}  items-center justify-around p-1`, "rounded-md", className)}
      >
        <ClockIcon className="mr-2 w-20 text-muted-foreground" />
        <Input
          containerClassName="w-10"
          className={cn(timePickerInputBase, "opacity-100 !w-[15px]")}
          {...timescape.getInputProps("hours")}
          placeholder="HH"
        />
        <span className={cn(timePickerSeparatorBase, "opacity-100")}>:</span>
        <Input
          containerClassName="w-20"
          className={cn(timePickerInputBase, "opacity-100 !w-[15px]")}
          {...timescape.getInputProps("minutes")}
          placeholder="MM"
        />
        {
          !options.hour12 && (
            <div className="w-[60px]">

            </div>
          )
        }
        {options.hour12 && (
          <Input
            className={cn(
              timePickerInputBase,
              "!w-[60px]  opacity-100",
            )}
            {...timescape.getInputProps("am/pm")}
            placeholder="AM/PM"
          />
        )}

        
      </div>
    );
  },
);

TimePicker.displayName = "TimePicker";

export default TimePicker;
