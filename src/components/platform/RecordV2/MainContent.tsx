'use client'
import { type ComponentProps } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MainContentProps = ComponentProps<"section">;

const MainContent = ({ children, className, ...props }: MainContentProps) => {

  const {open} = useSidebar();


  const width = !open ? "md:w-[calc(100vw-300px-3rem)] w-full" : "md:w-[calc(100vw-300px-16rem)] w-full";
  const height  = "h-[calc(100vh-200px)]";

  return (
    <section
      className={cn("max-h-full space-y-2 overflow-auto overflow-x-auto main-content ", 
        width,
        height,
        className)
      }
      {...props}
    >
      {children}
    </section>
  );
};

export default MainContent;
