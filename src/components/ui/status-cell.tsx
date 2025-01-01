import { cn } from "~/lib/utils";

interface StatusCellProps {
  value: string;
}
const StatusCell: React.FC<StatusCellProps> = ({ value }) => {
  const statuses = {
    active: "text-green-500 bg-green-400/10 ring-green-600",
    draft: "text-yellow-500 bg-yellow-400/10 ring-yellow-600",
    Active: "text-green-500 bg-green-400/10 ring-green-600",
    Draft: "text-yellow-500 bg-yellow-400/10 ring-yellow-600",
  };

  return (
    <div className="flex items-start m-1">
      <div
        className={cn(
          // @ts-expect-error - TS doesn't know about statuses
          statuses?.[value?.toLocaleLowerCase()],
          "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default StatusCell;
