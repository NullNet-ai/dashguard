interface IProps {
  created_date: string;
  created_time: "string";
  updated_date: string;
  updated_time: "string";
  created_by_first_name: "string";
  created_by_last_name: "string";
  updated_by_first_name: "string";
  updated_by_last_name: "string";
}

export default function SystemDates({
  created_date,
  created_time,
  updated_date,
  updated_time,
  created_by_first_name,
  created_by_last_name,
  updated_by_first_name,
  updated_by_last_name,
}: IProps) {
  return (
    <div className="px-4">
      <div className="p-2 text-sm">
        <div className="mb-2">
          <span className="text-slate-400">Created: </span>
          <span>
            {created_date} {created_time}{" "}
            {`${created_by_first_name} ${created_by_last_name}`}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Modified </span>
          <span>
            {updated_date} {updated_time}{" "}
            {`${updated_by_first_name} ${updated_by_last_name}`}
          </span>
        </div>
      </div>
    </div>
  );
}
