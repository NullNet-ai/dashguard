import { type ComponentProps } from "react";
import Tab from "./Tab";
import { cn } from "~/lib/utils";

export default async function MainTab({
  className,
}: ComponentProps<"section">) {
  return (
    <section className={cn("m-0 md:m-0  mb-0 flex-1 w-full lg:m-0 ", className)}>
      <Tab />
    </section>
  );
}
