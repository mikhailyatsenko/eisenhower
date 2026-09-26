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

const day = (date: number) => new Date(2026, 8, date);

const task = (text: string, dueDate: Date, hasDueTime?: boolean): Task => ({
  id: text,
  text,
  createdAt: CREATED,
  dueDate,
  ...(hasDueTime !== undefined && { hasDueTime }),
});

const card = (text: string) =>
  screen.getByRole('option', { name: new RegExp(`^${text}`) });

/** The date as the card shows it, in the test's (Node's) locale */
const shown = (date: Date, hasTime: boolean) =>
  formatDate(date, { hasTime, now: NOW });

const TIME = /\d:\d\d/;

type Page = Awaited<ReturnType<typeof renderHomePage>>;

const actOnTask = async ({ user }: Page, text: string, action: string) => {
  // Undo leaves the task selected: another click would clear it
  if (card(text).getAttribute('aria-selected') !== 'true') {
    await user.click(card(text));
  }
  await user.click(
    within(screen.getByRole('toolbar')).getByRole('button', { name: action }),
  );
};

const undo = ({ user }: Page) =>
  user.click(screen.getByRole('button', { name: 'Undo' }));

describe('Deadline on the card', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the status in words and the date', async () => {
    await renderHomePage({
      tasks: {
        ImportantUrgent: [
          task('Pay rent', day(24), false),
          task('Call the bank', day(25), false),
          task('Book dentist', day(26), false),
          task('Plan Q4 goals', new Date(2026, 9, 2), false),
        ],
      },
    });

    // Screen readers hear it with the task, without the decorative ⚠
    const overdue = card('Pay rent');
    expect(overdue).toHaveAccessibleName(/^Pay rent\W+OVERDUE\W+/);
    expect(overdue).toHaveAccessibleName(
      expect.stringContaining(shown(day(24), false)),
    );
    expect(overdue).not.toHaveAccessibleName(/⚠/);
    expect(overdue).toHaveTextContent('⚠');

    expect(card('Call the bank')).toHaveAccessibleName(
      expect.stringContaining('DUE TODAY'),
    );
    expect(card('Call the bank')).toHaveTextContent(shown(day(25), false));

    expect(card('Book dentist')).toHaveAccessibleName(
      expect.stringContaining('DUE SOON'),
    );
    expect(card('Book dentist')).toHaveTextContent(shown(day(26), false));

    const later = card('Plan Q4 goals');
    expect(later).toHaveTextContent(shown(new Date(2026, 9, 2), false));
    expect(later).not.toHaveTextContent(/OVERDUE|DUE/);

    // A deadline without a time shows none, relative words are gone
    [overdue, later].forEach((element) => {
      expect(element).not.toHaveTextContent(TIME);
      expect(element).not.toHaveTextContent(/\bin \d|overdue|ago/);
      expect(element).not.toHaveAttribute('title');
    });
  });

  it('shows the time of a deadline that has one, and of one set before R4', async () => {
    const withTime = new Date(2026, 8, 26, 18, 0);
    const beforeR4 = new Date(2026, 9, 7, 14, 0);
    await renderHomePage({
      tasks: {
        ImportantNotUrgent: [
          task('Renew passport', withTime, true),
          task('Old task', beforeR4),
        ],
      },
    });

    expect(card('Renew passport')).toHaveTextContent(shown(withTime, true));
    expect(card('Renew passport')).toHaveTextContent(TIME);
    expect(card('Old task')).toHaveTextContent(shown(beforeR4, true));
  });

  it('turns DUE TODAY into OVERDUE when the time passes, without a reload', async () => {
    jest.setSystemTime(new Date(2026, 8, 25, 8, 59));
    await renderHomePage({
      tasks: {
        ImportantUrgent: [
          task('Call the bank', new Date(2026, 8, 25, 9), true),
        ],
      },
    });

    expect(card('Call the bank')).toHaveAccessibleName(/DUE TODAY/);

    await act(async () => {
      jest.advanceTimersByTime(2 * 60_000);
    });

    expect(card('Call the bank')).toHaveAccessibleName(/OVERDUE/);
  });

  it('catches up when the tab becomes visible again', async () => {
    await renderHomePage({
      tasks: { ImportantUrgent: [task('Call the bank', day(25), false)] },
    });

    expect(card('Call the bank')).toHaveAccessibleName(/DUE TODAY/);

    // The laptop slept overnight: no timer fired
    jest.setSystemTime(new Date(2026, 8, 26, 8, 0));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(card('Call the bank')).toHaveAccessibleName(/OVERDUE/);
  });

  it('keeps a deadline without a time through Complete, Move, Delete and their Undo', async () => {
    const page = await renderHomePage({
      tasks: {
        ImportantUrgent: [
          task('Call the bank', day(25), false),
          task('Pay rent', day(26), false),
        ],
      },
    });

    await actOnTask(page, 'Call the bank', 'Complete');
    await undo(page);
    await actOnTask(page, 'Pay rent', 'Schedule');
    await undo(page);
    await actOnTask(page, 'Pay rent', 'Delete');
    await undo(page);
    await actOnTask(page, 'Pay rent', 'Schedule');

    // At 00:00 with a time it would be overdue and show 0:00
    expect(card('Call the bank')).toHaveAccessibleName(/DUE TODAY/);
    expect(card('Call the bank')).not.toHaveTextContent(TIME);
    expect(card('Pay rent')).toHaveAccessibleName(/DUE SOON/);
    expect(card('Pay rent')).not.toHaveTextContent(TIME);

    await page.reload();

    expect(card('Call the bank')).not.toHaveTextContent(TIME);
    expect(card('Pay rent')).not.toHaveTextContent(TIME);
  });

  it('keeps a deadline without a time when the task is edited', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: [task('Call the bank', day(25), false)] },
    });

    await user.click(card('Call the bank'));
    await user.keyboard('e');
    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    await user.type(
      within(dialog).getByPlaceholderText('What needs to be done?'),
      ' today',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(card('Call the bank today')).toHaveAccessibleName(/DUE TODAY/);
    expect(card('Call the bank today')).not.toHaveTextContent(TIME);
  });

  it('has no creation date on the card in List view', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: [task('Pay rent', day(24), false)] },
    });

    await user.click(screen.getByRole('tab', { name: 'List' }));

    const item = screen.getByText('Pay rent').closest('li')!;
    expect(item).toHaveTextContent('Pay rent');
    expect(item).toHaveTextContent('OVERDUE');
    expect(item).toHaveTextContent(shown(day(24), false));
    expect(item).not.toHaveTextContent('20/09/2026');
    expect(item).not.toHaveTextContent(TIME);
  });

  it('passes axe with an overdue card', async () => {
    await renderHomePage({
      tasks: {
        ImportantUrgent: [task('Pay rent', day(24), false)],
        ImportantNotUrgent: [task('Book dentist', day(26), false)],
      },
    });

    expect(card('Pay rent')).toHaveAccessibleName(/OVERDUE/);
    // axe waits on real timers
    jest.useRealTimers();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('Deadline in the cloud', () => {
  const ADA = { uid: 'u1', displayName: 'Ada' };

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps a deadline without a time on the server and after a reload', async () => {
    const page = await renderHomePage({
      signedIn: ADA,
      cloud: {
        tasks: {
          ImportantUrgent: [
            task('Call the bank', day(25), false),
            task('Pay rent', day(26), false),
          ],
        },
      },
    });

    await actOnTask(page, 'Call the bank', 'Complete');
    await undo(page);
    await actOnTask(page, 'Pay rent', 'Schedule');
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(page.cloud.serverTask('Call the bank').hasDueTime).toBe(false);
    expect(page.cloud.serverTask('Pay rent').hasDueTime).toBe(false);

    await page.reload();

    expect(card('Call the bank')).toHaveAccessibleName(/DUE TODAY/);
    expect(card('Call the bank')).not.toHaveTextContent(TIME);
    expect(card('Pay rent')).not.toHaveTextContent(TIME);
  });
});
