import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { ArrowPathIcon as Loader2 } from "@heroicons/react/24/outline";
import { Fragment } from "react";

const buttonVariants = cva(
  "active:translate-y-1 transition duration-200 inline-flex items-center justify-center rounded whitespace-nowrap text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        soft:
        "bg-primary/10 hover:bg-primary/20 text-primary",
        softPrimary:
        "bg-primary/10 hover:bg-primary/20 text-primary",
        softDestructive:
        "bg-destructive/10 hover:bg-destructive/20 text-destructive",
        softAccent:
        "bg-accent/10 hover:bg-accent/20 text-accent",
        softSecondary:
        "bg-secondary/10 hover:bg-secondary/20 text-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-slate-50 border border-[#E2E8F0]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        expandIcon:
          "group relative text-primary-foreground bg-primary hover:bg-primary/90",
        ringHover:
          "bg-primary text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
        gooeyRight:
          "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-zinc-400 before:transition-transform before:duration-1000  hover:before:translate-x-[0%] hover:before:translate-y-[0%] ",
        gooeyLeft:
          "text-primary-foreground relative bg-primary z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-zinc-400 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%] ",
        linkHover1:
          "relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
        linkHover2:
          "relative after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
      },
      size: {
        default: "h-[34px]  px-2",
        xs: "h-7  px-2",
        sm: "h-7  px-2",
        md: "h-[34px]  px-2",
        lg: "h-[40px]  px-3",
        icon: "h-10 w-10",
      },
      
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface IconProps {
  Icon?: React.ElementType;
  iconPlacement?: "left" | "right";
  iconClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
}

// interface IconRefProps {
//   Icon?: never;
//   iconPlacement?: undefined;
//   iconClassName?: undefined;
// }

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

// export type ButtonIconProps = IconProps | IconRefProps;
export type ButtonIconProps = IconProps ;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      name,
      className,
      variant,
      size,
      asChild = false,
      loading,
      Icon,
      iconClassName,
      iconPlacement = "right",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-test-id={name}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading}
        type="button"
        {...props}
      >
        <Fragment>
          {Icon &&
            iconPlacement === "left" &&
            variant !== "expandIcon" &&
            !loading && (
              <div className="w-5 lg:-translate-x-[50%]">
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
          {Icon &&
            iconPlacement === "left" &&
            variant === "expandIcon" &&
            !loading && (
              <div className="group-hover:translate-x-100 w-0 -translate-x-[50%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className={cn("h-5 w-5", iconClassName)} />
                )}
              </div>
            )}

          <Slottable>
            {loading && iconPlacement === "left" && (
              <Loader2
                className={cn("h-5 w-5 animate-spin", props.children && "mr-2")}
              />
            )}
            {props.children}
            {loading && iconPlacement === "right" && (
              <Loader2
                className={cn("h-5 w-5 animate-spin", props.children && "ml-2")}
              />
            )}
          </Slottable>
          {Icon &&
            iconPlacement === "right" &&
            variant !== "expandIcon" &&
            !loading && (
              <div className="w-5 lg:translate-x-[50%]">
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
          {Icon &&
            iconPlacement === "right" &&
            variant === "expandIcon" &&
            !loading && (
              <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </div>
            )}
        </Fragment>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
