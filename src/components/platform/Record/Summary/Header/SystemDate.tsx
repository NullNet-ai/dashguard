interface IProps {
  created_date: "string";
  created_time: "string";
  updated_date: "string";
  updated_time: "string";
  created_by_first_name: "string";
  created_by_last_name: "string";
  updated_by_first_name: "string";
  updated_by_last_name: "string";
  'data-test-id'?: string;
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
  'data-test-id': testId,
}: IProps) {
  return (
    <div className="px-4" data-test-id={testId}>
      <div className="p-2 text-sm" data-test-id={`${testId}-container`}>
        <div className="mb-2" data-test-id={`${testId}-created`}>
          <span className="text-slate-400">Created: </span>
          <span data-test-id={`${testId}-created-details`}>
            {created_date} {created_time}{" "}
            {`${created_by_first_name} ${created_by_last_name}`}
          </span>
        </div>
        <div data-test-id={`${testId}-modified`}>
          <span className="text-slate-400">Modified </span>
          <span data-test-id={`${testId}-modified-details`}>
            {updated_date} {updated_time}{" "}
            {`${updated_by_first_name} ${updated_by_last_name}`}
          </span>
        </div>
      </div>
    </div>
  );
}
