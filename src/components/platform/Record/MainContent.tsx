"use client";
import { useContext, type ComponentProps } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { useSideDrawer } from '../SideDrawer';
import { RecordWrapperContext } from './providers/RecordWrapperProvider';

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
  const {state: drawerState } = useSideDrawer()
  const { isCollapseRecordSummary } =
    useContext(RecordWrapperContext);


  const { isPinned, isOpen, width } = drawerState;

  const customStyle = {
    width: isCollapseRecordSummary ? '100%' : !open
      ? application === "record"
        ? (isOpen && isPinned && !!width) ? `calc(100vw - ${width})` : '100%'
        : "calc(100vw - 300px - 3rem)"
      : `calc(100vw - 300px - 16rem ${isOpen && isPinned && !!width  ? ` - ${width}` : ''} )`,
    height: "calc(100vh - 200px)",
  };


  return (
    <section
      className={cn(
        "main-content max-h-full space-y-2 overflow-auto overflow-x-auto",
        className,
      )}
      style={customStyle}
      {...props}
    >
      {children}
    </section>
  );
};

export default MainContent;
