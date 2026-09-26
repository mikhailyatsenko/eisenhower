import { deadlineChipDate } from './deadlineChipDate';

// September 2026: Fri 25, Sat 26, Sun 27, Mon 28
const at = (day: number, hours = 0, month = 8, year = 2026) =>
  new Date(year, month, day, hours);

describe('deadlineChipDate', () => {
  it.each([
    { chip: 'Today', now: at(25, 15), date: at(25) },
    { chip: 'Tomorrow', now: at(25, 15), date: at(26) },
    { chip: 'Tomorrow', now: at(31, 23, 11), date: at(1, 0, 0, 2027) },
    // The nearest Saturday; on the weekend it is today
    { chip: 'This weekend', now: at(24, 10), date: at(26) },
    { chip: 'This weekend', now: at(25, 23), date: at(26) },
    { chip: 'This weekend', now: at(26, 10), date: at(26) },
    { chip: 'This weekend', now: at(27, 10), date: at(27) },
    { chip: 'This weekend', now: at(28, 10), date: at(3, 0, 9) },
    // The Monday of next week
    { chip: 'Next week', now: at(25, 10), date: at(28) },
    { chip: 'Next week', now: at(27, 10), date: at(28) },
    { chip: 'Next week', now: at(28, 10), date: at(5, 0, 9) },
  ] as const)(
    '$chip on $now is $date at local midnight',
    ({ chip, now, date }) => {
      expect(deadlineChipDate(chip, now)).toEqual(date);
    },
  );
});
