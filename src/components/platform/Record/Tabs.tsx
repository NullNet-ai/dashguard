import { type ComponentProps } from "react";
// import Card from "~/components/platform/Card";
import { cn } from "~/lib/utils";

type TabsProps = ComponentProps<"nav">;

const Tabs = ({ children, className, ...props }: TabsProps) => {
  return (
    <div>
      <nav className={cn(className)} {...props}>
        {children}
      </nav>
    </div>
  );
};

export default Tabs;
