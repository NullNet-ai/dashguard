import { cn } from '~/lib/utils';

interface PillCellProps {
  value: string;
  bgColor?: string;
  textColor?: string;
  renderType?: 'value' | 'rounded';
  key?: string | number;
}
const PillCell: React.FC<PillCellProps> = ({ value, bgColor, textColor, key, renderType = 'value' } : PillCellProps) => {

  if(!value) return null

  if (!value) {
    return null;
  }

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
            bgColor,
            textColor,
          'inline-flex items-center rounded-md px-2 py-1 text-xs font-normal',
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default PillCell;
