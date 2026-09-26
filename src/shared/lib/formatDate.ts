interface FormatDateOptions {
  /** Without it the date is a whole day: no time is shown */
  hasTime: boolean;
  /** The year shows only for a date in another year than this */
  now: Date;
  /** The browser's locale by default, with its 12- or 24-hour clock */
  locale?: string;
}

/** A date as a person reads it: `Fri 25 Sept, 9:00` in en-GB */
export const formatDate = (
  date: Date,
  { hasTime, now, locale }: FormatDateOptions,
) =>
  date.toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
    ...(hasTime && { hour: 'numeric', minute: '2-digit' }),
  });
