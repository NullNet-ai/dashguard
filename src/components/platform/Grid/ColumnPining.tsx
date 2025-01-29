import { type Column } from "@tanstack/react-table";
import { cn } from "~/lib/utils";

const getCommonPinningStyles = (column: Column<any>) => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  // Conditional classes based on the pinning status
  const classNames = cn(
    isPinned === "left" && "sticky left-0 z-10", // Apply for pinned left
    isPinned === "right" && "sticky right-0 z-10", // Apply for pinned right
    isLastLeftPinnedColumn && "shadow-[4px_0_4px_-4px_gray_inset]", // Box shadow for last left pinned column
    isFirstRightPinnedColumn && "shadow-[-4px_0_4px_-4px_gray_inset]", // Box shadow for first right pinned column
  );

  // Handle dynamic styles for 'left' and 'right' positioning
  const dynamicStyles = {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
  };

  return {
    className: classNames,
    style: dynamicStyles,
  };
};

export { getCommonPinningStyles };
