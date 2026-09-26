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

const form = () => screen.getByRole('dialog');
const deadline = () => within(form()).getByRole('group', { name: 'Deadline' });
const chip = (name: string) => within(deadline()).getByRole('button', { name });
const dateField = () => within(deadline()).getByLabelText('Date');
const timeField = () => within(deadline()).queryByLabelText('Time');
const addTimeButton = () =>
  within(deadline()).getByRole('button', { name: '+ Add time' });

const PREVIEW = 'Shows on card as:';
/** The innermost element that holds the whole preview line */
const preview = () =>
  within(form()).queryByText(
    (_, element) =>
      !!element?.textContent?.startsWith(PREVIEW) &&
      ![...element.children].some((child) =>
        child.textContent?.startsWith(PREVIEW),
      ),
  );

const openNewTask = async ({ user }: Page, text: string) => {
  await user.click(screen.getByRole('button', { name: /new task/i }));
  await user.keyboard(text);
};

const openEdit = async ({ user }: Page, text: string) => {
  await user.click(card(text));
  await user.keyboard('e');
};

const save = ({ user }: Page) =>
  user.click(within(form()).getByRole('button', { name: 'Save' }));

const typeDate = async ({ user }: Page, value: string) => {
  await user.clear(dateField());
  if (value) await user.type(dateField(), value);
};

describe('Deadline in the task form', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sets a whole day with a chip and shows the card line before saving', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Renew passport');

    expect(dateField()).toHaveAttribute('type', 'date');
    expect(chip('No deadline')).toHaveAttribute('aria-pressed', 'true');
    expect(preview()).toBeNull();

    await page.user.click(chip('Tomorrow'));

    expect(chip('Tomorrow')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('No deadline')).toHaveAttribute('aria-pressed', 'false');
    expect(dateField()).toHaveValue('2026-09-26');
    expect(preview()).toHaveTextContent('DUE SOON');
    expect(preview()).toHaveTextContent(shown(day(26), false));
    expect(preview()).not.toHaveTextContent(TIME);
    // Plain text, not announced on every change
    expect(preview()?.closest('[aria-live]')).toBeNull();

    await save(page);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(card('Renew passport')).toHaveAccessibleName(/DUE SOON/);
    expect(card('Renew passport')).not.toHaveTextContent(TIME);
  });

  it('sets the dates of the other chips', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Plan the week');

    // Friday: the weekend is tomorrow, next week starts on Monday 28
    await page.user.click(chip('Today'));
    expect(dateField()).toHaveValue('2026-09-25');
    expect(preview()).toHaveTextContent('DUE TODAY');

    await page.user.click(chip('This weekend'));
    expect(dateField()).toHaveValue('2026-09-26');
    // Tomorrow is the same day: both chips set it
    expect(chip('This weekend')).toHaveAttribute('aria-pressed', 'true');

    await page.user.click(chip('Next week'));
    expect(dateField()).toHaveValue('2026-09-28');
    expect(chip('Next week')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('This weekend')).toHaveAttribute('aria-pressed', 'false');
  });

  it('adds an optional time and removes it again', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Renew passport');
    await page.user.click(chip('Tomorrow'));

    expect(timeField()).toBeNull();

    await page.user.click(addTimeButton());

    expect(timeField()).toHaveFocus();
    expect(timeField()).toHaveValue('09:00');
    expect(preview()).toHaveTextContent(shown(day(26, 9), true));
    // A chip sets a whole day: with a time none is picked
    expect(chip('Tomorrow')).toHaveAttribute('aria-pressed', 'false');

    // An emptied time field is still open: no chip is picked
    await page.user.clear(timeField()!);
    expect(preview()).not.toHaveTextContent(TIME);
    expect(chip('Tomorrow')).toHaveAttribute('aria-pressed', 'false');

    await page.user.type(timeField()!, '18:30');

    expect(preview()).toHaveTextContent(shown(day(26, 18, 30), true));

    await page.user.click(
      within(deadline()).getByRole('button', { name: 'Remove time' }),
    );

    expect(timeField()).toBeNull();
    expect(addTimeButton()).toHaveFocus();
    expect(preview()).not.toHaveTextContent(TIME);
    expect(chip('Tomorrow')).toHaveAttribute('aria-pressed', 'true');

    await page.user.click(addTimeButton());
    await page.user.clear(timeField()!);
    await page.user.type(timeField()!, '18:30');
    await save(page);

    expect(card('Renew passport')).toHaveTextContent(
      shown(day(26, 18, 30), true),
    );
  });

  it('drops the time when a chip is picked', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Renew passport');
    await page.user.click(chip('Tomorrow'));
    await page.user.click(addTimeButton());

    await page.user.click(chip('Next week'));

    expect(timeField()).toBeNull();
    expect(preview()).not.toHaveTextContent(TIME);
  });

  it('takes a date typed in the field as a whole day, in the past too', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Pay rent');

    await typeDate(page, '2026-09-24');

    expect(preview()).toHaveTextContent('OVERDUE');
    expect(preview()).toHaveTextContent(shown(day(24), false));
    expect(preview()).not.toHaveTextContent(TIME);
    ['No deadline', 'Today', 'Tomorrow', 'This weekend', 'Next week'].forEach(
      (name) => expect(chip(name)).toHaveAttribute('aria-pressed', 'false'),
    );

    await save(page);

    expect(card('Pay rent')).toHaveAccessibleName(/OVERDUE/);
  });

  it('drops the time together with an emptied date', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Renew passport');
    await page.user.click(chip('Tomorrow'));
    await page.user.click(addTimeButton());

    await typeDate(page, '');

    expect(timeField()).toBeNull();
    expect(preview()).toBeNull();
    expect(chip('No deadline')).toHaveAttribute('aria-pressed', 'true');

    await save(page);

    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');
  });

  it('removes a deadline with No deadline', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: [task('Pay rent', day(24), false)] },
    });
    await openEdit(page, 'Pay rent');

    expect(chip('Today')).toHaveAttribute('aria-pressed', 'false');
    expect(dateField()).toHaveValue('2026-09-24');
    expect(preview()).toHaveTextContent('OVERDUE');

    await page.user.click(chip('No deadline'));

    expect(chip('No deadline')).toHaveAttribute('aria-pressed', 'true');
    expect(dateField()).toHaveValue('');
    expect(preview()).toBeNull();

    await save(page);

    expect(card('Pay rent')).toHaveAccessibleName('Pay rent');
    expect(card('Pay rent')).not.toHaveTextContent(/OVERDUE|DUE/);
  });

  it('shows and keeps the time of a deadline set before R4', async () => {
    const beforeR4 = new Date(2026, 9, 7, 14, 0);
    const page = await renderHomePage({
      tasks: { ImportantNotUrgent: [task('Old task', beforeR4)] },
    });
    await openEdit(page, 'Old task');

    expect(dateField()).toHaveValue('2026-10-07');
    expect(timeField()).toHaveValue('14:00');
    expect(preview()).toHaveTextContent(shown(beforeR4, true));

    await page.user.type(
      within(form()).getByRole('textbox', { name: /description/i }),
      '!',
    );
    await save(page);

    expect(card('Old task!')).toHaveTextContent(shown(beforeR4, true));
  });

  it('marks the chip of a whole-day deadline being edited', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: [task('Call the bank', day(25), false)] },
    });
    await openEdit(page, 'Call the bank');

    expect(chip('Today')).toHaveAttribute('aria-pressed', 'true');
    expect(timeField()).toBeNull();
  });

  it('uses native fields, not react-datepicker, and passes axe with the time open', async () => {
    const page = await renderHomePage();
    await openNewTask(page, 'Renew passport');
    await page.user.click(chip('Tomorrow'));
    await page.user.click(addTimeButton());

    expect(timeField()).toHaveAttribute('type', 'time');
    expect(document.querySelector('[class*="react-datepicker"]')).toBeNull();
    expect(within(form()).queryByRole('checkbox')).toBeNull();
    expect(within(form()).queryByRole('button', { name: '+3h' })).toBeNull();

    // axe waits on real timers
    jest.useRealTimers();
    expect(await axe(form())).toHaveNoViolations();
  });
});

describe('Deadline in the form of a signed-in user', () => {
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
    await openEdit(page, 'Call the bank');
    await page.user.click(chip('Tomorrow'));
    await save(page);

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
