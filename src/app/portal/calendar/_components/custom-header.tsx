import moment from 'moment-timezone';
import { getTimezoneAbbreviation } from '~/components/ui/calendar/_components/views/_common/utils';
import { type CalendarHeaderRenderProps } from '~/components/ui/calendar/_components/views/components/CalendarHeader/CalendarHeader';

const CustomHeader = (props: CalendarHeaderRenderProps) => {
  const { uniqueDates, numberOfDays } = props;

  if (!uniqueDates?.[0]?.date) {
    return <span>No dates available</span>;
  }

  // Calculate the date range based on numberOfDays
  const datesToShow = uniqueDates.slice(0, numberOfDays);
  const firstDate = moment(datesToShow[0]?.date || '');
  const lastDate = moment(datesToShow[datesToShow.length - 1]?.date || '');

  // Format the date range
  const formattedRange = `${firstDate.format('MMM D')} - ${lastDate.format('MMM D, YYYY')}`;
  const myCurrentTimezone = moment.tz.guess();

  return (
    <div className="flex items-center justify-between bg-white p-4">
      <h2 className="font-medium">This is custom header</h2>
      <div className="flex flex-col items-end text-sm">
        <span>
          {formattedRange} ({getTimezoneAbbreviation(myCurrentTimezone)})
        </span>
        <div>
          {/* number of days */}
          <span className="text-slate-400">{numberOfDays} days</span>
        </div>
      </div>
    </div>
  );
};

CustomHeader.displayName = 'CustomHeader';

export default CustomHeader;
