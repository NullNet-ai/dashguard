import { cn } from "~/lib/utils";

export const getTabStyles = (
  orientation: "horizontal" | "vertical" = "horizontal",
  className?: string,
) => ({
  container: cn(
    "w-full",
    orientation === "vertical" ? "flex flex-row" : "flex flex-col",
    className,
  ),
  tabList: cn(
    "flex relative",
    orientation === "vertical" ? "flex-col" : "flex-row",
    "border-b border-border",
    {
      "overflow-x-auto scrollbar-hide": orientation === "horizontal",
      "w-64 border-r border-b-0": orientation === "vertical",
    },
  ),
  tab: (
    isActive: boolean,
    variant?: string,
    size?: string,
    disabled?: boolean,
  ) =>
    cn(
      "relative flex items-center gap-2 transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      {
        // Default variant
        "border-b-2 border-transparent hover:border-primary/30 hover:text-primary":
          variant === "default" && !isActive,
        "border-b-2 border-primary font-medium text-primary":
          variant === "default" && isActive,

        // Pills variant
        "hover:bg-primary/10 hover:text-primary rounded-md":
          variant === "pills" && !isActive,
        "bg-primary text-primary-foreground rounded-md shadow-sm":
          variant === "pills" && isActive,

        // Underline variant
        "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-primary after:transition-transform hover:text-primary hover:after:scale-x-100":
          variant === "underline" && !isActive,
        "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-100 after:bg-primary font-medium text-primary":
          variant === "underline" && isActive,

        // Sizes
        "px-3 py-1.5 text-sm": size === "sm",
        "px-4 py-2 text-base": size === "md",
        "px-6 py-3 text-lg": size === "lg",

        // Default states
        "text-muted-foreground": !isActive,

        // Disabled state
        "opacity-50 cursor-not-allowed pointer-events-none": disabled,

        // Default states
      },
    ),
});
