import { deadlineStatus } from './deadlineStatus';

// Local time: the status follows the device's calendar
const at = (day: number, hours = 0, minutes = 0, month = 8, year = 2026) =>
  new Date(year, month, day, hours, minutes);

describe('deadlineStatus', () => {
  it.each([
    // With a time: the minute it passes
    {
      name: 'a minute before a timed deadline',
      due: at(25, 9),
      hasDueTime: true,
      now: at(25, 8, 59),
      status: 'today',
    },
    {
      name: 'a minute after a timed deadline',
      due: at(25, 9),
      hasDueTime: true,
      now: at(25, 9, 1),
      status: 'overdue',
    },
    {
      name: 'a timed deadline this morning, now in the evening',
      due: at(25, 9),
      hasDueTime: true,
      now: at(25, 20),
      status: 'overdue',
    },
    // Without a time: the end of the day
    {
      name: 'a day deadline at 00:00 of its day',
      due: at(25),
      hasDueTime: false,
      now: at(25, 0, 0),
      status: 'today',
    },
    {
      name: 'a day deadline at noon of its day',
      due: at(25),
      hasDueTime: false,
      now: at(25, 12),
      status: 'today',
    },
    {
      name: 'a day deadline at 23:59 of its day',
      due: at(25),
      hasDueTime: false,
      now: at(25, 23, 59),
      status: 'today',
    },
    {
      name: 'a day deadline at 00:00 of the next day',
      due: at(25),
      hasDueTime: false,
      now: at(26, 0, 0),
      status: 'overdue',
    },
    {
      name: 'a day deadline yesterday',
      due: at(24),
      hasDueTime: false,
      now: at(25, 9),
      status: 'overdue',
    },
    // Soon: tomorrow and the day after
    {
      name: 'a day deadline tomorrow',
      due: at(26),
      hasDueTime: false,
      now: at(25, 23, 59),
      status: 'soon',
    },
    {
      name: 'a timed deadline the day after tomorrow',
      due: at(27, 18),
      hasDueTime: true,
      now: at(25, 9),
      status: 'soon',
    },
    {
      name: 'a deadline in three days',
      due: at(28),
      hasDueTime: false,
      now: at(25, 9),
      status: null,
    },
    {
      name: 'a deadline next week',
      due: at(2, 9, 0, 9),
      hasDueTime: true,
      now: at(25, 9),
      status: null,
    },
    // Tasks from before R4 have no flag: their deadline has a time
    {
      name: 'a deadline without the flag at 00:00 today, now in the morning',
      due: at(25),
      hasDueTime: undefined,
      now: at(25, 9),
      status: 'overdue',
    },
    {
      name: 'a deadline without the flag later today',
      due: at(25, 18),
      hasDueTime: undefined,
      now: at(25, 9),
      status: 'today',
    },
    // New Year
    {
      name: 'a deadline on 1 January, now on 31 December',
      due: at(1, 0, 0, 0, 2027),
      hasDueTime: false,
      now: at(31, 12, 0, 11),
      status: 'soon',
    },
    {
      name: 'a deadline on 31 December, now on 1 January',
      due: at(31, 0, 0, 11),
      hasDueTime: false,
      now: at(1, 0, 0, 0, 2027),
      status: 'overdue',
    },
  ] as const)('$name → $status', ({ due, hasDueTime, now, status }) => {
    expect(deadlineStatus(due, hasDueTime, now)).toBe(status);
  });

  it('has no status without a deadline', () => {
    expect(deadlineStatus(undefined, undefined, at(25, 9))).toBeNull();
  });
});
