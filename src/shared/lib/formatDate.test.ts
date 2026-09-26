import { formatDate } from './formatDate';

const NOW = new Date(2026, 8, 24, 11, 30);
const FRIDAY = new Date(2026, 8, 25);
const FRIDAY_9AM = new Date(2026, 8, 25, 9, 0);
const FRIDAY_6PM = new Date(2026, 8, 25, 18, 0);
const NEXT_YEAR = new Date(2027, 9, 29);

// The exact punctuation is whatever Intl gives for the locale: the table
// checks the parts, not the string
describe('formatDate', () => {
  it.each([
    {
      name: 'en-GB, a day',
      locale: 'en-GB',
      date: FRIDAY,
      hasTime: false,
      parts: ['Fri', '25', 'Sep'],
      absent: ['2026', ':'],
    },
    {
      name: 'en-GB, with a time on the 24-hour clock',
      locale: 'en-GB',
      date: FRIDAY_6PM,
      hasTime: true,
      parts: ['Fri', '25', 'Sep', '18:00'],
      absent: ['2026', 'PM'],
    },
    {
      name: 'en-US, a day, the month first',
      locale: 'en-US',
      date: FRIDAY,
      hasTime: false,
      parts: ['Fri', 'Sep 25'],
      absent: ['2026', ':'],
    },
    {
      name: 'en-US, with a time on the 12-hour clock',
      locale: 'en-US',
      date: FRIDAY_6PM,
      hasTime: true,
      parts: ['Fri', 'Sep 25', '6:00', 'PM'],
      absent: ['18:00'],
    },
    {
      name: 'en-US, a morning time',
      locale: 'en-US',
      date: FRIDAY_9AM,
      hasTime: true,
      parts: ['9:00', 'AM'],
      absent: [],
    },
    {
      name: 'de-DE, a day',
      locale: 'de-DE',
      date: FRIDAY,
      hasTime: false,
      parts: ['Fr', '25.', 'Sept'],
      absent: ['2026', ':'],
    },
    {
      name: 'de-DE, with a time on the 24-hour clock',
      locale: 'de-DE',
      date: FRIDAY_6PM,
      hasTime: true,
      parts: ['Fr', '25.', '18:00'],
      absent: ['PM'],
    },
    {
      name: 'en-GB, another year shows the year',
      locale: 'en-GB',
      date: NEXT_YEAR,
      hasTime: false,
      parts: ['Fri', '29', 'Oct', '2027'],
      absent: [':'],
    },
    {
      name: 'en-US, another year shows the year',
      locale: 'en-US',
      date: NEXT_YEAR,
      hasTime: true,
      parts: ['Oct 29', '2027', '12:00', 'AM'],
      absent: [],
    },
  ] as const)('$name', ({ locale, date, hasTime, parts, absent }) => {
    const text = formatDate(date, { hasTime, now: NOW, locale });

    parts.forEach((part) => expect(text).toContain(part));
    absent.forEach((part) => expect(text).not.toContain(part));
  });

  it('shows the year of a date after New Year, but not of this year', () => {
    const newYearsEve = new Date(2026, 11, 31, 12, 0);
    const options = { hasTime: false, now: newYearsEve, locale: 'en-GB' };

    expect(formatDate(new Date(2027, 0, 1), options)).toContain('2027');
    expect(formatDate(new Date(2026, 11, 31), options)).not.toContain('2026');
  });

  it("takes the browser's locale by default", () => {
    expect(formatDate(FRIDAY_6PM, { hasTime: true, now: NOW })).toBe(
      FRIDAY_6PM.toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      }),
    );
  });
});
