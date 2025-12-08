import moment from 'moment-timezone';

export const calculateWeekStart = (weekOffset: number, timezone = 'Asia/Manila', numberOfDays = 7, referenceDate?: string): moment.Moment => {
  const today = referenceDate ? moment.tz(referenceDate, timezone) : moment().tz(timezone);
  const dayOfWeek = today.day();

  let daysToFriday;
  if (dayOfWeek === 5) {
    daysToFriday = 0;
  } else if (dayOfWeek === 6) {
    daysToFriday = 1;
  } else {
    daysToFriday = dayOfWeek + 2;
  }

  return today
    .clone()
    .subtract(daysToFriday, 'days')
    .add(weekOffset * numberOfDays, 'days');
};

export const generateWeekDates = (startOfWeek: moment.Moment, numberOfDays = 7) => {
  return Array.from({ length: numberOfDays }, (_, i) => 
    startOfWeek.clone().add(i, 'days')
  );
};

export const generateHours = () => {
  return Array.from({ length: 24 }, (_, i) => i);
};

// Calculate week offset to jump to a specific date
export const calculateWeekOffsetForDate = (targetDate: string, timezone = 'America/Los_Angeles', numberOfDays = 7): number => {
  const today = moment().tz(timezone);
  // Parse the date string as local date first, then convert to timezone
  const target = moment.tz(targetDate, timezone);
  

  
  // Calculate the start of current week (Friday-based) using the same logic as calculateWeekStart
  const todayDayOfWeek = today.day();
  let daysToCurrentFriday;
  if (todayDayOfWeek === 5) {
    daysToCurrentFriday = 0; // Today is Friday
  } else if (todayDayOfWeek === 6) {
    daysToCurrentFriday = 1; // Today is Saturday, go back 1 day to Friday
  } else {
    // Sunday (0) to Thursday (4): calculate days back to previous Friday
    // For Sunday (0): need to go back 2 days to Friday
    // For Monday (1): need to go back 3 days to Friday  
    // For Tuesday (2): need to go back 4 days to Friday
    // For Wednesday (3): need to go back 5 days to Friday
    // For Thursday (4): need to go back 6 days to Friday
    daysToCurrentFriday = todayDayOfWeek + 2;
  }
  const currentWeekStart = today.clone().subtract(daysToCurrentFriday, 'days');
  

  
  // Calculate the start of target week (Friday-based)
  const targetDayOfWeek = target.day();
  let daysToTargetFriday;
  if (targetDayOfWeek === 5) {
    daysToTargetFriday = 0; // Target is Friday
  } else if (targetDayOfWeek === 6) {
    daysToTargetFriday = 1; // Target is Saturday, go back 1 day to Friday
  } else {
    // Sunday (0) to Thursday (4): calculate days back to previous Friday
    daysToTargetFriday = targetDayOfWeek + 2;
  }
  const targetWeekStart = target.clone().subtract(daysToTargetFriday, 'days');
  

  
  // Calculate the difference in periods (using numberOfDays instead of weeks)
  const daysDiff = targetWeekStart.diff(currentWeekStart, 'days');
  const periodsDiff = Math.floor(daysDiff / numberOfDays);
  

  
  return periodsDiff;
};