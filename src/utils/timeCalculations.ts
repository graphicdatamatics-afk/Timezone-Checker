import { BaseTimeInput, CalculatedZoneTime, DayShift, TimezoneLocation, WorkStatus } from '../types/timezone';

/**
 * Converts a 12-hour time (hour 1-12, minute 0-59, ampm) into 24-hour hour (0-23).
 */
export function to24Hour(hour12: number, minute: number, ampm: 'AM' | 'PM'): { hour24: number; minute: number } {
  let hour24 = hour12;
  if (ampm === 'PM' && hour12 !== 12) {
    hour24 += 12;
  } else if (ampm === 'AM' && hour12 === 12) {
    hour24 = 0;
  }
  return { hour24, minute };
}

/**
 * Converts 24-hour hour (0-23) into 12-hour format (1-12, 'AM' | 'PM').
 */
export function to12Hour(hour24: number, minute: number): { hour12: number; minute: number; ampm: 'AM' | 'PM'; formatted: string } {
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const ampm: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const formatted = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
  return { hour12, minute, ampm, formatted };
}

/**
 * Formats a 12h time string.
 */
export function format12h(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
}

/**
 * Finds the exact UTC Date that corresponds to (baseYear-baseMonth-baseDay + 12h time) in reference timeZone.
 */
export function getUtcInstantForLocalTime(
  baseYear: number,
  baseMonth: number, // 0-indexed
  baseDay: number,
  hour12: number,
  minute: number,
  ampm: 'AM' | 'PM',
  refTimeZone: string
): Date {
  const { hour24 } = to24Hour(hour12, minute, ampm);

  // Initial UTC timestamp guess
  let timestamp = Date.UTC(baseYear, baseMonth, baseDay, hour24, minute, 0);

  // Iteratively refine to handle any offset / DST accurately
  for (let i = 0; i < 3; i++) {
    const testDate = new Date(timestamp);
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: refTimeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    });

    const parts = dtf.formatToParts(testDate);
    const y = parseInt(parts.find(p => p.type === 'year')?.value || `${baseYear}`, 10);
    const m = parseInt(parts.find(p => p.type === 'month')?.value || `${baseMonth + 1}`, 10) - 1;
    const d = parseInt(parts.find(p => p.type === 'day')?.value || `${baseDay}`, 10);
    const h = parseInt(parts.find(p => p.type === 'hour')?.value || `${hour24}`, 10);
    const min = parseInt(parts.find(p => p.type === 'minute')?.value || `${minute}`, 10);

    const testUtcDay = Date.UTC(y, m, d, h, min, 0);
    const targetUtcDay = Date.UTC(baseYear, baseMonth, baseDay, hour24, minute, 0);

    const diffMs = targetUtcDay - testUtcDay;
    if (diffMs === 0) break;
    timestamp += diffMs;
  }

  return new Date(timestamp);
}

/**
 * Computes the calculated times AND dates for all locations relative to the base reference.
 */
export function calculateAllZoneTimes(
  locations: TimezoneLocation[],
  refLocationId: string,
  baseInput: BaseTimeInput
): CalculatedZoneTime[] {
  const refLocation = locations.find(l => l.id === refLocationId) || locations[0];

  // Parse base date (YYYY-MM-DD)
  const dateParts = baseInput.date.split('-').map(Number);
  const baseYear = dateParts[0] || 2026;
  const baseMonth = (dateParts[1] || 11) - 1; // 0-indexed
  const baseDay = dateParts[2] || 3;

  // Exact UTC moment
  const utcInstant = getUtcInstantForLocalTime(
    baseYear,
    baseMonth,
    baseDay,
    baseInput.hour12,
    baseInput.minute,
    baseInput.ampm,
    refLocation.timeZone
  );

  // Reference location parts
  const refDtf = new Intl.DateTimeFormat('en-US', {
    timeZone: refLocation.timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });
  const refParts = refDtf.formatToParts(utcInstant);
  const refYear = parseInt(refParts.find(p => p.type === 'year')?.value || `${baseYear}`, 10);
  const refMonth = parseInt(refParts.find(p => p.type === 'month')?.value || `${baseMonth + 1}`, 10) - 1;
  const refDay = parseInt(refParts.find(p => p.type === 'day')?.value || `${baseDay}`, 10);
  const refHour24 = parseInt(refParts.find(p => p.type === 'hour')?.value || '0', 10);
  const refMin = parseInt(refParts.find(p => p.type === 'minute')?.value || '0', 10);

  const refAbsoluteMinutes = (Date.UTC(refYear, refMonth, refDay, refHour24, refMin) / 60000);

  return locations.map(loc => {
    const isReference = loc.id === refLocation.id;

    // Detailed local parts for this location
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: loc.timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const parts = dtf.formatToParts(utcInstant);
    const locYear = parseInt(parts.find(p => p.type === 'year')?.value || `${baseYear}`, 10);
    const locMonth = parseInt(parts.find(p => p.type === 'month')?.value || `${baseMonth + 1}`, 10) - 1;
    const locDay = parseInt(parts.find(p => p.type === 'day')?.value || `${baseDay}`, 10);
    const locHour12 = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
    const locMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const locAmpm = (parts.find(p => p.type === 'dayPeriod')?.value || 'AM').toUpperCase() as 'AM' | 'PM';

    const { hour24: locHour24 } = to24Hour(locHour12, locMinute, locAmpm);
    const locAbsoluteMinutes = (Date.UTC(locYear, locMonth, locDay, locHour24, locMinute) / 60000);

    const diffMinutes = Math.round(locAbsoluteMinutes - refAbsoluteMinutes);

    // Exact calendar date comparisons
    const refMidnightMs = Date.UTC(refYear, refMonth, refDay);
    const locMidnightMs = Date.UTC(locYear, locMonth, locDay);
    const dayDiff = Math.round((locMidnightMs - refMidnightMs) / (86400000));

    let dayShift: DayShift = 'today';
    let dayShiftLabel = 'Today';
    if (dayDiff < 0) {
      dayShift = 'yesterday';
      dayShiftLabel = dayDiff === -1 ? '(yesterday) local time' : `(${Math.abs(dayDiff)} days ago) local time`;
    } else if (dayDiff > 0) {
      dayShift = 'tomorrow';
      dayShiftLabel = dayDiff === 1 ? '(tomorrow) local time' : `(+${dayDiff} days ahead) local time`;
    }

    // Relative difference formatted text
    let diffFormatted = '';
    if (isReference) {
      diffFormatted = 'Base Reference';
    } else if (diffMinutes === 0) {
      diffFormatted = `Same time as ${refLocation.city}`;
    } else if (diffMinutes > 0) {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      const hoursText = hours > 0 ? `${hours}h` : '';
      const minsText = mins > 0 ? `${mins}m` : '';
      diffFormatted = `+${[hoursText, minsText].filter(Boolean).join(' ')} ahead of ${refLocation.city}`;
    } else {
      const absDiff = Math.abs(diffMinutes);
      const hours = Math.floor(absDiff / 60);
      const mins = absDiff % 60;
      const hoursText = hours > 0 ? `${hours}h` : '';
      const minsText = mins > 0 ? `${mins}m` : '';
      diffFormatted = `-${[hoursText, minsText].filter(Boolean).join(' ')} behind of ${refLocation.city}`;
    }

    // Work status calculation (exact Slack/Teams style)
    let workStatus: WorkStatus = 'active';
    let statusLabel = 'Active';

    if (locHour24 >= loc.typicalWorkStart && locHour24 < loc.typicalWorkEnd) {
      workStatus = 'active';
      statusLabel = 'Active';
    } else if (
      (locHour24 >= loc.typicalWorkStart - 2 && locHour24 < loc.typicalWorkStart) ||
      (locHour24 >= loc.typicalWorkEnd && locHour24 < 22)
    ) {
      workStatus = 'flexible';
      statusLabel = 'Away, flexible hours';
    } else {
      workStatus = 'sleeping';
      statusLabel = 'Away, notifications snoozed';
    }

    const formattedTime = format12h(locHour12, locMinute, locAmpm);

    // Formatted Dates
    const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: loc.timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: loc.timeZone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: loc.timeZone,
      weekday: 'short',
    });
    const monthFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: loc.timeZone,
      month: 'short',
    });

    const dateString = shortDateFormatter.format(utcInstant); // e.g. "Tue, Nov 3, 2026"
    const fullDateString = fullDateFormatter.format(utcInstant); // e.g. "Tuesday, November 3, 2026"
    const dayOfWeek = weekdayFormatter.format(utcInstant); // e.g. "Tue"
    const monthName = monthFormatter.format(utcInstant); // e.g. "Nov"

    return {
      location: loc,
      hour12: locHour12,
      minute: locMinute,
      ampm: locAmpm,
      formattedTime,
      dateString,
      fullDateString,
      dayOfWeek,
      dayNumber: locDay,
      monthName,
      year: locYear,
      dayShift,
      dayShiftLabel,
      diffMinutes,
      diffFormatted,
      workStatus,
      statusLabel,
      isReference,
      hour24: locHour24,
    };
  });
}

/**
 * Extracts current live time and date in a target timezone as BaseTimeInput.
 */
export function getCurrentLiveTimeInZone(timeZone: string): BaseTimeInput {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const parts = dtf.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '11';
  const day = parts.find(p => p.type === 'day')?.value || '03';
  const hour12 = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const ampm = (parts.find(p => p.type === 'dayPeriod')?.value || 'AM').toUpperCase() as 'AM' | 'PM';

  return {
    hour12,
    minute,
    ampm,
    date: `${year}-${month}-${day}`,
  };
}
