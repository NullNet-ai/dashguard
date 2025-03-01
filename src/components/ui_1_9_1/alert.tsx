import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { Terminal } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid"; // Import the X icon

const alertVariants = cva(
  "relative w-full p-4 [&>svg~*]:pl-9 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-[13px] [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        warning: "bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-500",
        error: "bg-red-50 text-red-800 [&>svg]:text-red-500",
        success: "bg-green-50 text-green-800 [&>svg]:text-green-500",
        info: "bg-blue-50 text-blue-800 [&>svg]:text-blue-500",
      },
      withAccentBorder: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "default", withAccentBorder: true, class: "border-l-[2px] border-foreground" },
      { variant: "warning", withAccentBorder: true, class: "border-l-[2px] border-yellow-400" },
      { variant: "error", withAccentBorder: true, class: "border-l-[2px] border-red-400" },
      { variant: "success", withAccentBorder: true, class: "border-l-[2px] border-green-400" },
      { variant: "info", withAccentBorder: true, class: "border-l-[2px] border-blue-400" },
    ],
    defaultVariants: {
      variant: "default",
      withAccentBorder: false,
    },
  },
);

const defaultIcons = {
  default: Terminal,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
  info: InformationCircleIcon,
};

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & { withAccentBorder?: boolean; Icon?: React.ElementType; IconClassName?: string; dismissible?: boolean; onDismiss?: () => void }
>(({ className, variant = "default", withAccentBorder = false, Icon, IconClassName, dismissible = false, onDismiss, ...props }, ref) => {
  const IconComponent = Icon || defaultIcons[variant as keyof typeof defaultIcons];
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant, withAccentBorder }), className)}
      {...props}
    >
      {IconComponent && <IconComponent className={cn("h-5 w-5", IconClassName)} />}
      {props.children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="absolute top-1/2 -translate-y-1/2 right-3"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertContent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertContent.displayName = "AlertContent";

const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex", className)}
    {...props}
  />
));
AlertActions.displayName = "AlertActions";

export { Alert, AlertTitle, AlertContent, AlertActions };
