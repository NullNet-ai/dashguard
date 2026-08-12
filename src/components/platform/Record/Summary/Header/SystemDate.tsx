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

  const removeSeconds = (timeString: string) => {
    if (!timeString) return timeString;
    return timeString.replace(/(\d{2}:\d{2}):\d{2}/, '$1');
  };
  
  const truncateName = (firstName: string, lastName: string) => {
    const fullName = firstName + ' ' + lastName;
    return fullName.length > 11 ? fullName.substring(0, 11) + '...' : fullName;
  };
  
  const createdByName = truncateName(created_by_first_name, created_by_last_name);
  const updatedByName = truncateName(updated_by_first_name, updated_by_last_name);

  return (
    <div data-test-id={testId}>
      <div className="flex flex-col gap-1 text-sm" data-test-id={`${testId}-container`}>
        <div className="flex justify-between gap-2" data-test-id={`${testId}-created`}>
          <span className="text-slate-500 whitespace-nowrap">Created </span>
          <span className='break-all' data-test-id={`${testId}-created-details`}>
            {created_date} {removeSeconds(created_time)}{created_by_first_name && ", "}
            {createdByName}
          </span>
        </div>
        <div className='flex justify-between gap-2' data-test-id={`${testId}-modified`}>
          <span className="text-slate-500 whitespace-nowrap">Modified </span>
          <span className='break-all' data-test-id={`${testId}-modified-details`}>
            {updated_date} {removeSeconds(updated_time)}{updated_by_first_name && ", "}
            {updatedByName}
          </span>
        </div>
      </div>
    </div>
  );
}
