import { cn } from '~/lib/utils';

interface StatusCellProps {
  value: string;
  additionalStatuses?: Record<string, string>;
  key?: string | number;
  renderType?: 'value' | 'rounded';
}
const StatusCell: React.FC<StatusCellProps> = ({ value, additionalStatuses = {}, key, renderType = 'value' } : {
  value: string,
  additionalStatuses?: Record<string, string>,
  renderType?: 'value' | 'rounded',
  key?: string | number,
}) => {
  const statuses = {
    active: 'text-green-600 bg-green-400/10',
    draft: 'text-yellow-500 bg-yellow-400/10',
    Active: 'text-green-600 bg-green-400/10',
    Draft: 'text-yellow-500 bg-yellow-400/10',
    archived: 'text-gray-600 bg-gray-400/10',
    ...additionalStatuses,
  };
  if(!value) return null

  if (!value) {
    return null;
  }

  const statusesRounded = {
    active: 'text-green-600 bg-green-600',
    draft: 'text-yellow-500 bg-yellow-500',
    Active: 'text-green-600 bg-green-600',
    Draft: 'text-yellow-500 bg-yellow-500',
    archived: 'text-gray-600 bg-gray-600',
    Archived: 'text-gray-600 bg-gray-600',
    ...additionalStatuses,
  };


  if(renderType === 'rounded') {
    return <div className={cn(`size-3 rounded-full`, 
      // @ts-expect-error - TS doesn't know about statuses
      statusesRounded?.[value?.toLocaleLowerCase()], )} 
    />
  }

  return (
    <div className="lg:my-[2px] lg:mr-[3px] my-0 flex flex-row items-start">
      <div
        className={cn(
          'bg-primary/10 text-primary',
          // @ts-expect-error - TS doesn't know about statuses
          statuses?.[value?.toLocaleLowerCase()],
          'inline-flex items-center rounded-md px-2 py-1 text-xs font-normal',
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default StatusCell;
