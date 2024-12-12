import { type ComponentProps } from "react";
import { cn } from "~/lib/utils";

type MainContentProps = ComponentProps<"section">;

const MainContent = ({ children, className, ...props }: MainContentProps) => {
  return (
    <section
      className={cn("max-h-full space-y-2 overflow-auto", className)}
      {...props}
    >
      {children}
    </section>
  );
};

export default MainContent;
