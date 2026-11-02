export interface TimezoneLocation {
  id: string;
  name: string;             // e.g. "Bangalore, KA, India"
  city: string;             // e.g. "Bangalore"
  region: string;           // e.g. "KA, India"
  country: string;          // e.g. "India"
  flag: string;             // e.g. "🇮🇳"
  timeZone: string;         // IANA string e.g. "Asia/Kolkata"
  tzCode: string;           // e.g. "IST"
  isCore: boolean;          // true for the priority 4
  typicalWorkStart: number; // 9 = 9 AM
  typicalWorkEnd: number;   // 18 = 6 PM
}

export type DayShift = 'yesterday' | 'today' | 'tomorrow';

export type WorkStatus = 'active' | 'flexible' | 'sleeping';

export interface CalculatedZoneTime {
  location: TimezoneLocation;
  hour12: number;          // 1 to 12
  minute: number;          // 0 to 59
  ampm: 'AM' | 'PM';
  formattedTime: string;   // e.g. "09:30 AM"
  dateString: string;      // e.g. "Tue, Nov 3, 2026"
  fullDateString: string;  // e.g. "Tuesday, November 3, 2026"
  dayOfWeek: string;       // e.g. "Tuesday"
  dayNumber: number;       // e.g. 3
  monthName: string;       // e.g. "Nov"
  year: number;            // e.g. 2026
  dayShift: DayShift;      // 'yesterday' | 'today' | 'tomorrow'
  dayShiftLabel: string;   // e.g. "(yesterday) local time"
  diffMinutes: number;     // relative difference in minutes from reference base
  diffFormatted: string;   // e.g. "+2h 30m ahead of Bangalore" or "Base Reference"
  workStatus: WorkStatus;  // active | flexible | sleeping
  statusLabel: string;     // e.g. "Active", "Away, notifications snoozed"
  isReference: boolean;
  hour24: number;          // 0 to 23 (internal for timeline grid)
}

export interface BaseTimeInput {
  hour12: number;          // 1 to 12
  minute: number;          // 0 to 59
  ampm: 'AM' | 'PM';
  date: string;            // 'YYYY-MM-DD' e.g. '2026-11-03'
}
