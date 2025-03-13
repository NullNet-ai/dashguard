"use client";
import { type ComponentProps } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MainContentProps = ComponentProps<"section"> & {
  application?: string;
};

const MainContent = ({
  children,
  className,
  application,
  ...props
}: MainContentProps) => {
  const { open } = useSidebar();

  const width = !open
    ? `${application === "record" ? "w-full" : ""} w-full`
    : "md:w-[calc(100vw-300px-16rem)] w-full";
  const height = "h-[calc(100vh-200px)]";

  return (
    <section
      className={cn(
        "main-content max-h-full overflow-auto",
        width,
        height,
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
};

export default MainContent;
