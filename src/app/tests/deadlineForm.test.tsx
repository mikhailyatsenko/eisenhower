import { act, screen, within } from '@testing-library/react';
import { formatDate } from '@/shared/lib/formatDate';
import { Task } from '@/shared/stores/tasksStore';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

// Friday 25 September 2026, 9:30 local time
const NOW = new Date(2026, 8, 25, 9, 30);
const CREATED = new Date(2026, 8, 20, 10, 0);

const day = (date: number, hours = 0, minutes = 0) =>
  new Date(2026, 8, date, hours, minutes);

const task = (text: string, dueDate?: Date, hasDueTime?: boolean): Task => ({
  id: text,
  text,
  createdAt: CREATED,
  ...(dueDate && { dueDate }),
  ...(hasDueTime !== undefined && { hasDueTime }),
});

const card = (text: string) =>
  screen.getByRole('option', { name: new RegExp(`^${text}`) });

/** The date as the card shows it, in the test's (Node's) locale */
const shown = (date: Date, hasTime: boolean) =>
  formatDate(date, { hasTime, now: NOW });

const TIME = /\d:\d\d/;

type Page = Awaited<ReturnType<typeof renderHomePage>>;

const strip = () =>
  screen.getByRole('group', { name: 'Deadline for the new task in Do First' });
const chip = (name: string | RegExp) =>
  within(strip()).getByRole('button', { name });
const dateField = () => within(strip()).getByLabelText('Date');
const timeField = () => within(strip()).queryByLabelText('Time');
const addButton = () => within(strip()).getByRole('button', { name: /^Add/ });

const openAddField = async ({ user }: Page, text: string) => {
  await user.keyboard('n');
  await user.keyboard(text);
};

/** The deadline of a task in the matrix: the Deadline button's choices */
const openDeadline = async ({ user }: Page, text: string) => {
  await user.click(card(text));
  await user.keyboard('d');
};
const choices = (text: string) =>
  screen.getByRole('group', { name: `Deadline for “${text}”` });
const choice = (text: string, name: string) =>
  within(choices(text)).getByRole('button', { name });
const deadlineButton = () =>
  within(screen.getByRole('toolbar')).getByRole('button', {
    name: /^Deadline/,
  });

const typeDate = async ({ user }: Page, value: string) => {
  await user.clear(dateField());
  if (value) await user.type(dateField(), value);
};

describe('Deadline of a task', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('takes a date typed while adding as a whole day, in the past too', async () => {
    const page = await renderHomePage();
    await openAddField(page, 'Pay rent');

    await typeDate(page, '2026-09-24');

    expect(addButton()).toHaveAccessibleName(`Add · ${shown(day(24), false)}`);
    ['No deadline', 'Tomorrow', 'This weekend', 'Next week'].forEach((name) =>
      expect(chip(new RegExp(`^${name}`))).toHaveAttribute(
        'aria-pressed',
        'false',
      ),
    );

    await page.user.keyboard('{Enter}');

    expect(card('Pay rent')).toHaveAccessibleName(/OVERDUE/);
    expect(card('Pay rent')).not.toHaveTextContent(TIME);
  });

  it('drops the time while adding when a chip is picked or the date is emptied', async () => {
    const page = await renderHomePage();
    await openAddField(page, 'Renew passport');
    await page.user.click(chip(/^Tomorrow/));
    await page.user.click(chip('+ Time'));

    await page.user.click(chip(/^Next week/));

    expect(timeField()).toBeNull();
    expect(addButton()).toHaveAccessibleName(`Add · ${shown(day(28), false)}`);

    await page.user.click(chip('+ Time'));
    await typeDate(page, '');

    expect(timeField()).toBeNull();
    expect(chip(/^No deadline/)).toHaveAttribute('aria-pressed', 'true');

    await page.user.click(addButton());

    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');
  });

  it('uses native fields while adding, not react-datepicker, and passes axe with the time open', async () => {
    const page = await renderHomePage();
    await openAddField(page, 'Renew passport');
    await page.user.click(chip(/^Tomorrow/));
    await page.user.click(chip('+ Time'));

    expect(dateField()).toHaveAttribute('type', 'date');
    expect(timeField()).toHaveAttribute('type', 'time');
    expect(document.querySelector('[class*="react-datepicker"]')).toBeNull();
    expect(within(strip()).queryByRole('checkbox')).toBeNull();
    expect(within(strip()).queryByRole('button', { name: '+3h' })).toBeNull();

    // axe waits on real timers
    jest.useRealTimers();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('removes a deadline with No deadline', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: [task('Pay rent', day(24), false)] },
    });
    await openDeadline(page, 'Pay rent');

    expect(choice('Pay rent', 'Tomorrow')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(within(choices('Pay rent')).getByLabelText('Date')).toHaveValue(
      '2026-09-24',
    );

    await page.user.click(choice('Pay rent', 'No deadline'));

    expect(deadlineButton()).toHaveAccessibleName('Deadline');
    expect(card('Pay rent')).toHaveAccessibleName('Pay rent');
    expect(card('Pay rent')).not.toHaveTextContent(/OVERDUE|DUE/);
  });

  it('shows and keeps the time of a deadline set before R4', async () => {
    const beforeR4 = new Date(2026, 9, 7, 14, 0);
    const page = await renderHomePage({
      tasks: { ImportantNotUrgent: [task('Old task', beforeR4)] },
    });
    await openDeadline(page, 'Old task');

    expect(within(choices('Old task')).getByLabelText('Date')).toHaveValue(
      '2026-10-07',
    );
    expect(within(choices('Old task')).getByLabelText('Time')).toHaveValue(
      '14:00',
    );
    await page.user.keyboard('{Escape}');

    // A new text leaves the deadline as it is
    await page.user.keyboard('e');
    await page.user.keyboard('{End}!{Enter}');

    expect(card('Old task!')).toHaveTextContent(shown(beforeR4, true));
  });

  it('marks the chip of a whole-day deadline being edited', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: [task('Call the bank', day(28), false)] },
    });
    await openDeadline(page, 'Call the bank');

    expect(choice('Call the bank', 'Next week')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      within(choices('Call the bank')).queryByLabelText('Time'),
    ).toBeNull();
  });
});

describe('Deadline of a signed-in user', () => {
  const ADA = { uid: 'u1', displayName: 'Ada' };

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('changes the deadline offline at once, and on the server once online', async () => {
    const page = await renderHomePage({
      signedIn: ADA,
      cloud: {
        tasks: { ImportantUrgent: [task('Call the bank', day(30, 14), true)] },
      },
    });

    page.cloud.goOffline();
    await openDeadline(page, 'Call the bank');
    await page.user.click(choice('Call the bank', 'Tomorrow'));

    expect(card('Call the bank')).toHaveAccessibleName(/DUE SOON/);
    expect(card('Call the bank')).not.toHaveTextContent(TIME);
    expect(page.cloud.serverTask('Call the bank').dueDate).toEqual(day(30, 14));

    page.cloud.goOnline();
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const onServer = page.cloud.serverTask('Call the bank');
    expect(onServer.dueDate).toEqual(day(26));
    expect(onServer.hasDueTime).toBe(false);

    await page.reload();

    expect(card('Call the bank')).toHaveAccessibleName(/DUE SOON/);
    expect(card('Call the bank')).not.toHaveTextContent(TIME);
  });
});
