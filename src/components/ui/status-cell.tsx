import { cn } from "~/lib/utils";

interface StatusCellProps {
  value: string;
}
const StatusCell: React.FC<StatusCellProps> = ({ value }) => {
  const statuses = {
    active: "text-green-600 bg-green-400/10",
    draft: "text-yellow-500 bg-yellow-400/10",
    Active: "text-green-600 bg-green-400/10",
    Draft: "text-yellow-500 bg-yellow-400/10",
    archived: "text-gray-600 bg-gray-400/10",
    Archived: "text-gray-600 bg-gray-400/10",
  };

  return (
    <div className="flex items-start m-1"> 
      <div
        className={cn(
          "bg-primary/10 text-primary",
          // @ts-expect-error - TS doesn't know about statuses
          statuses?.[value?.toLocaleLowerCase()],
          "inline-flex items-center rounded-md px-2 py-1 text-sm font-normal ",
          
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default StatusCell;
