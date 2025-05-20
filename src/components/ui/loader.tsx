import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "~/lib/utils";

const loaderVariants = cva("relative block opacity-[0.65]", {
  variants: {
    variant: {
      spinner: "", // Original spinner
      circular: "",
      circularShadow: "",
      custom: "object-contain", // New variant for custom images
    },
    size: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "spinner",
  },
});

export interface LoaderProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof loaderVariants> {
  loading?: boolean;
  asChild?: boolean;
  label?: string;
  progress?: number;
  customImage?: string; // New prop for custom image URL
  imageAlt?: string; // New prop for image alt text
}

const Loader = React.forwardRef<HTMLSpanElement, LoaderProps>(
  (
    {
      className,
      size,
      variant,
      loading = true,
      asChild = false,
      label = "Loading",
      progress = 0,
      customImage,
      imageAlt = "Loading animation",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "span";

    const [bgColorClass, filteredClassName] = React.useMemo(() => {
      const bgClass = className?.match(/(?:dark:bg-|bg-)[a-zA-Z0-9-]+/g) || [];
      const filteredClasses = className
        ?.replace(/(?:dark:bg-|bg-)[a-zA-Z0-9-]+/g, "")
        .trim();
      return [bgClass, filteredClasses];
    }, [className]);

    if (!loading) return null;

    // If customImage is provided, override variant to use custom
    const effectiveVariant = customImage ? "custom" : variant;

    const renderLoader = () => {
      if (customImage) {
        return (
          <img 
            src={customImage} 
            alt={imageAlt}
            className="h-full w-full"
          />
        );
      }

      switch (effectiveVariant) {
        case "circular":
          return (
            <div className="relative h-full w-full animate-spin rounded-full border-4 border-transparent border-t-foreground"></div>
          );
        case "circularShadow":
          return (
            <div className="relative h-full w-full animate-spin rounded-full border-4 border-border border-t-foreground"></div>
          );
        default: // Original spinner
          return (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="animate-spinner-leaf-fade absolute left-1/2 top-0 h-full w-[15%] rounded-full"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    animationDelay: `${-(7 - i) * 100}ms`,
                  }}
                >
                  <span
                    className={cn(
                      "block h-[16%] w-full rounded-full",
                      bgColorClass,
                    )}
                  />
                </span>
              ))}
            </>
          );
      }
    };

    return (
      <div
        className="flex flex-col items-center"
        aria-live="polite"
        aria-busy="true"
      >
        <Comp
          className={cn(
            loaderVariants({ size, variant: effectiveVariant, className: filteredClassName }),
          )}
          ref={ref}
          {...props}
        >
          {renderLoader()}
        </Comp>
        {label && <span className="mt-2 text-sm">{label}</span>}
      </div>
    );
  },
);

Loader.displayName = "Loader";

export { Loader };