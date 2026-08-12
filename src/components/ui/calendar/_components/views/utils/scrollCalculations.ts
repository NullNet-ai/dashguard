export const calculateScrollPosition = (
  currentDateGroupIndex: number,
  currentHour: number,
  currentMinute: number,
  uniqueDates: any[]
) => {
  const dateHeaderHeight = 60;
  const hourHeight = 80;

  let scrollPosition = 0;

  // Add height for previous date groups
  for (let i = 0; i < currentDateGroupIndex; i++) {
    scrollPosition += dateHeaderHeight;
    scrollPosition += uniqueDates[i].timeline.length * hourHeight;
  }

  // Add current date header
  scrollPosition += dateHeaderHeight;

  // Add hours before current hour
  scrollPosition += currentHour * hourHeight;

  // Add minutes within current hour
  scrollPosition += (currentMinute / 60) * hourHeight;

  return Math.max(0, scrollPosition - 200);
};