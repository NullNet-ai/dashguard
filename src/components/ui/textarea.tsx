/* eslint-disable @typescript-eslint/no-empty-object-type */
import * as React from "react";

import { cn } from "~/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: React.ElementType;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, name, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-1.5 top-2 h-5 w-5 text-muted-foreground" />}
        <textarea
          className={cn(
        "flex max-h-[658px] max-w-[658.5px] min-h-[80px] h-fit w-full rounded-md border border-input bg-background",
        Icon ? "ps-7" : "px-2",
        "py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
          )}
          // rows={3}
          data-test-id={name}
          name={name}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
