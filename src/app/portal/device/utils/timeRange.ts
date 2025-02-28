import moment from "moment-timezone";

export const getLastSecondsTimeStamp = (seconds: number) => {
  const now = new Date()

  const last_seconds = new Date(now)
  last_seconds.setSeconds(now.getSeconds() - seconds)

  const replace = (_date: Date) => _date.toISOString().replace('T', ' ')
    .substring(0, 19) + '+00'

  const formatted_now = replace(now)
  const formatted_ast = replace(last_seconds)

  const result = [formatted_ast, formatted_now]

  return result
}


export const getLastMinutesTimeStamp = (minutes: number) => {
  const now = new Date()

  const last_minutes = new Date(now)
  last_minutes.setMinutes(now.getMinutes() - minutes)

  const replace = (_date: Date) => _date.toISOString().replace('T', ' ')
    .substring(0, 19) + '+00'

  const formatted_now = replace(now)
  const formatted_ast = replace(last_minutes)

  const result = [formatted_ast, formatted_now]

  
  return result
}

export const getLastTwentyFourHoursTimeStamp = () => {
  const now = new Date();

  const last_hours = new Date(now);
  last_hours.setHours(now.getHours() - 24);
  const replace = (_date: Date) =>
    _date.toISOString().replace("T", " ").substring(0, 19) + "+00";

  const formattedNow = replace(now);
  const formattedLast24 = replace(last_hours);

  const result = [formattedLast24, formattedNow];

  return result;
};


export const getLastTimeStamp = (
  amount: number,
  unit: "second" | "minute" | "hour" | "day" | "month"
) => {
  const now = new Date();
  const past = new Date(now);

  switch (unit) {
    case "second":
      past.setSeconds(now.getSeconds() - amount);
      break;
    case "minute":
      past.setSeconds(0);
      past.setMinutes(now.getMinutes() - amount);
      break;
    case "hour":
      past.setSeconds(0);
      past.setMinutes(0);
      past.setHours(now.getHours() - amount);
      break;
    case "day":
      past.setSeconds(0);
      past.setMinutes(0);
      past.setHours(0);
      past.setDate(now.getDate() - amount);
      break;
    case "month":
      past.setSeconds(0);
      past.setMinutes(0);
      past.setHours(0);
      past.setDate(1);
      past.setMonth(now.getMonth() - amount);
      break;
  }

  const formatDate = (date: Date) => {
    if (unit === "day" || unit === "month") {
      return date.toISOString().substring(0, 10); // YYYY-MM-DD (No time)
    }
    return date.toISOString().replace("T", " ").substring(0, 19) + "+00"; // Full timestamp
  };

  return [formatDate(past), formatDate(now)];
};






export function getAllTimestampsBetweenDates(
  startDate: string,
  endDate: string,
  unit: "hour" | "minute" | "second" | "day" | "month",
  interval: number
): string[] {
  

  const start = moment(startDate, "YYYY-MM-DD HH:mm:ss");
  const end = moment(endDate, "YYYY-MM-DD HH:mm:ss");
  const timestampsArray: string[] = [];

  

  // Reset smaller units to 0 based on the selected unit
  switch (unit) {
    case "minute":
      start.seconds(0);
      break;
    case "hour":
      start.minutes(0).seconds(0);
      break;
    case "day":
      start.hours(0).minutes(0).seconds(0);
      break;
    case "month":
      start.date(1).hours(0).minutes(0).seconds(0);
      break;
  }

  while (start.isSameOrBefore(end)) {
    timestampsArray.push(
      unit === "day" || unit === "month"
        ? start.format("YYYY-MM-DD") // No time for days/months
        : start.format("YYYY-MM-DD HH:mm:ss") // Full timestamp for hours/minutes/seconds
    );
    start.add(interval, unit); // Increment by exactly 1 unit
  }

  
  return timestampsArray;
}

export const getUnit = (unit: string) => {
  let unitFull: "second" | "minute" | "hour" | "day" | "month";

  switch (unit) {
    case 's':
      unitFull = "second";
      break;
    case 'm':
      unitFull = "minute";
      break;
    case 'h':
      unitFull = "hour";
      break;
    case 'd':
      unitFull = "day";
      break;
    case 'M':
      unitFull = "month";
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
  }

  return unitFull
}

export function parseTimeString(timeString: string): { value: number; unit: string } | null {
  const match = timeString.match(/^(\d+)([a-zA-Z]+)$/);

  if (match) {
    return {
      value: parseInt(match[1], 10), // Extract number
      unit: getUnit(match[2])  as string// Extract unit (e.g., "s", "m", "h")
    };
  }

  return null; // Return null if the format is invalid
}
