import { act, fireEvent, screen, within } from '@testing-library/react';
import { formatDate } from '@/shared/lib/formatDate';
import { Task } from '@/shared/stores/tasksStore';
import { axe } from './axe';
import { centerOf, dragOver, mockQuadrantLayout } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

// Friday 25 September 2026, 9:30 local time
const FRIDAY = new Date(2026, 8, 25, 9, 30);
const SUNDAY = new Date(2026, 8, 27, 9, 30);
const CREATED = new Date(2026, 8, 20, 10, 0);

const PHONE = { width: 390, pointer: 'coarse' } as const;

const day = (date: number, hours = 0, minutes = 0) =>
  new Date(2026, 8, date, hours, minutes);

const task = (text: string, dueDate?: Date, hasDueTime?: boolean): Task => ({
  id: text,
  text,
  createdAt: CREATED,
  ...(dueDate && { dueDate }),
  ...(hasDueTime !== undefined && { hasDueTime }),
});

/** The date as the card and the button show it, in the test's (Node's) locale */
const shown = (date: Date, hasTime = false, now = FRIDAY) =>
  formatDate(date, { hasTime, now });

const TASKS = {
  ImportantUrgent: [
    task('Renew passport'),
    task('Pay rent', day(28), false),
    task('Call the bank'),
  ],
  ImportantNotUrgent: [task('Plan the week')],
};

const card = (text: string) =>
  screen.getByRole('option', { name: new RegExp(`^${text}`) });
const toolbar = () => screen.getByRole('toolbar');
const deadlineButton = () =>
  within(toolbar()).getByRole('button', { name: /^Deadline/ });
const chooser = (text: string) =>
  screen.getByRole('group', { name: `Deadline for “${text}”` });
const chip = (text: string, name: string | RegExp) =>
  within(chooser(text)).getByRole('button', { name });

/** Last in a test: axe waits on real timers, so the clock runs from here on */
const expectNoAxeViolations = async () => {
  jest.useRealTimers();
  expect(await axe(document.body)).toHaveNoViolations();
};

type Page = Awaited<ReturnType<typeof renderHomePage>>;

const select = async ({ user }: Page, text: string) => {
  await user.click(card(text));
};

const openByKey = async (page: Page, text: string) => {
  await select(page, text);
  await page.user.keyboard('d');
};

const openByClick = async (page: Page, text: string) => {
  await select(page, text);
  await page.user.click(deadlineButton());
};

describe('Deadline button in the action panel', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: FRIDAY });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the deadline on the button, or the word Deadline without one', async () => {
    const page = await renderHomePage({ tasks: TASKS });

    await select(page, 'Renew passport');
    expect(deadlineButton()).toHaveAccessibleName('Deadline');
    expect(deadlineButton()).toHaveAttribute('aria-keyshortcuts', 'D');
    // The key hint on desktop
    expect(deadlineButton()).toHaveTextContent(/D$/);

    await select(page, 'Pay rent');
    expect(deadlineButton()).toHaveAccessibleName(
      `Deadline, ${shown(day(28))}`,
    );
    expect(deadlineButton()).toHaveTextContent(shown(day(28)));
  });

  it('turns the panel into the deadline choices on a click', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    const group = chooser('Renew passport');
    expect(
      within(group).queryByRole('button', { name: /Complete/ }),
    ).not.toBeInTheDocument();
    expect(
      within(group).queryByRole('button', { name: /Edit/ }),
    ).not.toBeInTheDocument();
    expect(chip('Renew passport', /^No deadline/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(chip('Renew passport', /^Today/)).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(chip('Renew passport', /^No deadline/)).toHaveFocus();
    expect(
      within(group).getByRole('button', { name: /Back/ }),
    ).toBeInTheDocument();
    expect(within(group).getByLabelText('Date')).toHaveAttribute(
      'type',
      'date',
    );
    expect(within(group).getByRole('button', { name: 'Set' })).toBeDisabled();
  });

  it('focuses the pressed chip of a task with a deadline', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: [task('Pay rent', day(26), false)] },
    });
    await openByClick(page, 'Pay rent');

    // Friday: Tomorrow and This weekend are the same Saturday
    expect(chip('Pay rent', /^Tomorrow/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(chip('Pay rent', /^This weekend/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(chip('Pay rent', /^No deadline/)).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(chip('Pay rent', /^Tomorrow/)).toHaveFocus();
  });

  it('sets Tomorrow on D, M and leaves the focus on the task for the arrows', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByKey(page, 'Renew passport');
    await page.user.keyboard('m');

    expect(card('Renew passport')).toHaveAccessibleName(/DUE SOON/);
    expect(card('Renew passport')).toHaveTextContent(shown(day(26)));
    expect(toolbar()).toBeInTheDocument();
    expect(deadlineButton()).toHaveAccessibleName(
      `Deadline, ${shown(day(26))}`,
    );
    expect(card('Renew passport')).toHaveFocus();
    // No toast, no Undo
    expect(
      screen.queryByRole('button', { name: /Undo/ }),
    ).not.toBeInTheDocument();

    await page.user.keyboard('{ArrowDown}');
    expect(card('Pay rent')).toHaveFocus();
    // The order in the quadrant stays
    expect(
      within(screen.getByRole('listbox', { name: 'Do First' }))
        .getAllByRole('option')
        .map((option) => option.dataset.taskId),
    ).toEqual(['Renew passport', 'Pay rent', 'Call the bank']);
  });

  it('puts the focus back on the Deadline button after a chip clicked', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');
    await page.user.click(chip('Renew passport', /^Tomorrow/));

    expect(card('Renew passport')).toHaveAccessibleName(/DUE SOON/);
    expect(deadlineButton()).toHaveFocus();
    expect(deadlineButton()).toHaveAccessibleName(
      `Deadline, ${shown(day(26))}`,
    );
    expect(card('Renew passport')).toHaveAttribute('aria-selected', 'true');
  });

  it('sets This weekend, Next week, Today and No deadline by their keys', async () => {
    const page = await renderHomePage({ tasks: TASKS });

    await openByKey(page, 'Renew passport');
    await page.user.keyboard('w');
    expect(card('Renew passport')).toHaveTextContent(shown(day(26)));

    await page.user.keyboard('d');
    await page.user.keyboard('x');
    expect(card('Renew passport')).toHaveTextContent(shown(day(28)));

    await page.user.keyboard('d');
    await page.user.keyboard('t');
    expect(card('Renew passport')).toHaveAccessibleName(/DUE TODAY/);

    await page.user.keyboard('d');
    await page.user.keyboard('{Delete}');
    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');
    expect(deadlineButton()).toHaveAccessibleName('Deadline');

    await page.user.keyboard('d');
    await page.user.keyboard('t');
    await page.user.keyboard('d');
    await page.user.keyboard('{Backspace}');
    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');
    // Still there: the key cleared the deadline, it didn't delete the task
    expect(card('Renew passport')).toHaveFocus();
  });

  it('sets today for This weekend on a Sunday', async () => {
    jest.setSystemTime(SUNDAY);
    const page = await renderHomePage({ tasks: TASKS });
    await openByKey(page, 'Renew passport');
    await page.user.keyboard('w');

    expect(card('Renew passport')).toHaveAccessibleName(/DUE TODAY/);
    expect(card('Renew passport')).toHaveTextContent(
      shown(day(27), false, SUNDAY),
    );
  });

  it('goes back without changes on Esc and ← Back, the focus by the rule', async () => {
    const page = await renderHomePage({ tasks: TASKS });

    await openByKey(page, 'Pay rent');
    await page.user.keyboard('{Escape}');
    expect(toolbar()).toBeInTheDocument();
    expect(card('Pay rent')).toHaveFocus();
    expect(card('Pay rent')).toHaveAttribute('aria-selected', 'true');
    expect(card('Pay rent')).toHaveTextContent(shown(day(28)));

    await page.user.click(deadlineButton());
    await page.user.click(
      within(chooser('Pay rent')).getByRole('button', { name: /Back/ }),
    );
    expect(deadlineButton()).toHaveFocus();
    expect(deadlineButton()).toHaveAccessibleName(
      `Deadline, ${shown(day(28))}`,
    );

    // Opened by Enter on the button: back on the button too
    await page.user.keyboard('{Enter}');
    expect(chooser('Pay rent')).toBeInTheDocument();
    await page.user.keyboard('{Escape}');
    expect(deadlineButton()).toHaveFocus();
  });

  it('sets a date of its own with a time on Enter, Set disabled without a date', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');
    const group = chooser('Renew passport');
    const set = within(group).getByRole('button', { name: 'Set' });

    expect(set).toBeDisabled();
    expect(
      within(group).queryByRole('button', { name: '+ Time' }),
    ).not.toBeInTheDocument();

    const date = within(group).getByLabelText('Date');
    // Letters type in the field, they don't pick a chip
    await page.user.type(date, '2026-10-02');
    expect(set).toBeEnabled();
    expect(chooser('Renew passport')).toBeInTheDocument();

    await page.user.click(
      within(group).getByRole('button', { name: '+ Time' }),
    );
    const time = within(group).getByLabelText('Time');
    expect(time).toHaveValue('09:00');
    expect(time).toHaveFocus();

    await page.user.keyboard('{Enter}');

    expect(card('Renew passport')).toHaveTextContent(shown(day(32, 9), true));
    expect(deadlineButton()).toHaveFocus();
  });

  it('saves a date of its own on Set', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');
    const group = chooser('Renew passport');

    await page.user.type(within(group).getByLabelText('Date'), '2026-10-02');
    await page.user.click(within(group).getByRole('button', { name: 'Set' }));

    expect(card('Renew passport')).toHaveTextContent(shown(day(32)));
    expect(card('Renew passport')).not.toHaveTextContent(/\d:\d\d/);
  });

  it('keeps Undo and the matrix keys out with the focus past the choices, and Esc still goes back', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await select(page, 'Call the bank');
    await page.user.keyboard('c');
    expect(screen.getByRole('button', { name: /Undo/ })).toBeInTheDocument();

    await select(page, 'Renew passport');
    await page.user.keyboard('d');
    // Out of the choices: the focus is on the page, not in them
    act(() => (document.activeElement as HTMLElement).blur());

    await page.user.keyboard('{Control>}z{/Control}c');
    expect(
      screen.queryByRole('option', { name: /^Call the bank/ }),
    ).not.toBeInTheDocument();
    expect(card('Renew passport')).toBeInTheDocument();

    await page.user.keyboard('{Escape}');
    expect(toolbar()).toHaveAccessibleName('Actions for “Renew passport”');
  });

  it('puts the focus back on the Deadline button after D pressed in the panel', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await select(page, 'Renew passport');
    await page.user.tab();
    expect(
      within(toolbar()).getByRole('button', { name: /Complete/ }),
    ).toHaveFocus();

    await page.user.keyboard('d');
    await page.user.keyboard('m');

    expect(deadlineButton()).toHaveFocus();
  });

  it('leaves the matrix keys alone while choosing', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByKey(page, 'Renew passport');

    await page.user.keyboard('c2n?');

    expect(card('Renew passport')).toBeInTheDocument();
    expect(
      within(screen.getByRole('listbox', { name: 'Do First' }))
        .getAllByRole('option')
        .map((option) => option.dataset.taskId),
    ).toEqual(['Renew passport', 'Pay rent', 'Call the bank']);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(chooser('Renew passport')).toBeInTheDocument();
  });

  it('works by the physical keys on a Cyrillic layout', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await select(page, 'Renew passport');

    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'в',
          code: 'KeyD',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(chooser('Renew passport')).toBeInTheDocument();

    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ь',
          code: 'KeyM',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(card('Renew passport')).toHaveAccessibleName(/DUE SOON/);
  });

  it('closes without saving when another task is selected', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');
    await page.user.type(
      within(chooser('Renew passport')).getByLabelText('Date'),
      '2026-10-02',
    );

    await select(page, 'Plan the week');

    expect(
      screen.queryByRole('group', { name: /^Deadline for/ }),
    ).not.toBeInTheDocument();
    expect(toolbar()).toHaveAccessibleName('Actions for “Plan the week”');
    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');

    // Back on the first task: the panel, not the choices
    await select(page, 'Renew passport');
    expect(toolbar()).toHaveAccessibleName('Actions for “Renew passport”');
  });

  it('has no Deadline for a completed task, and D does nothing', async () => {
    const done: Task = {
      ...task('File taxes'),
      completed: true,
      completedAt: day(24),
      quadrantKey: 'ImportantUrgent',
    };
    const page = await renderHomePage({
      tasks: TASKS,
      completedTasks: [done],
    });
    await page.user.click(screen.getByRole('tab', { name: 'List' }));
    await page.user.click(screen.getByRole('button', { name: /^Completed, / }));
    await select(page, 'File taxes');

    expect(
      within(toolbar()).queryByRole('button', { name: /^Deadline/ }),
    ).not.toBeInTheDocument();
    await page.user.keyboard('d');
    expect(
      screen.queryByRole('group', { name: /^Deadline for/ }),
    ).not.toBeInTheDocument();
    expect(toolbar()).toBeInTheDocument();
  });

  it('works the same in List view', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await page.user.click(screen.getByRole('tab', { name: 'List' }));

    await openByClick(page, 'Renew passport');
    await page.user.click(chip('Renew passport', /^Next week/));

    expect(card('Renew passport')).toHaveTextContent(shown(day(28)));
    expect(deadlineButton()).toHaveFocus();
    await expectNoAxeViolations();

    await page.user.click(deadlineButton());
    expect(chooser('Renew passport')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('closes when the view switches', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');

    await page.user.click(screen.getByRole('tab', { name: 'List' }));
    await select(page, 'Renew passport');

    expect(toolbar()).toHaveAccessibleName('Actions for “Renew passport”');
  });

  it('has no axe violations with the button and the choices on desktop', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await select(page, 'Pay rent');
    await expectNoAxeViolations();

    await page.user.click(deadlineButton());
    await expectNoAxeViolations();
  });

  describe('on a phone', () => {
    it('has a full-width Deadline row under Complete, Edit, Delete and over Move to', async () => {
      const page = await renderHomePage({ tasks: TASKS, viewport: PHONE });
      await select(page, 'Renew passport');

      expect(
        within(toolbar())
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual([
        '×',
        'Complete',
        'Edit',
        'Delete',
        'DeadlineNone›',
        'Do First',
        'Schedule',
        'Delegate',
        'Eliminate',
      ]);
      expect(deadlineButton()).toHaveAccessibleName('Deadline');

      await select(page, 'Pay rent');
      expect(deadlineButton()).toHaveTextContent(shown(day(28)));
      expect(deadlineButton()).toHaveAccessibleName(
        `Deadline, ${shown(day(28))}`,
      );
      await expectNoAxeViolations();
    });

    it('shows the chips with their dates and a visible Date label', async () => {
      const page = await renderHomePage({ tasks: TASKS, viewport: PHONE });
      await openByClick(page, 'Renew passport');

      expect(chip('Renew passport', /^Tomorrow/)).toHaveAccessibleName(
        `Tomorrow ${shown(day(26))}`,
      );
      expect(chip('Renew passport', /^Next week/)).toHaveTextContent(
        shown(day(28)),
      );
      expect(
        within(chooser('Renew passport')).getByText('Date'),
      ).not.toHaveClass('sr-only');

      await page.user.click(chip('Renew passport', /^Tomorrow/));
      expect(deadlineButton()).toHaveTextContent(shown(day(26)));

      await page.user.click(deadlineButton());
      await expectNoAxeViolations();
    });

    it('has no axe violations with the choices in List view', async () => {
      const page = await renderHomePage({ tasks: TASKS, viewport: PHONE });
      await page.user.click(screen.getByRole('tab', { name: 'List' }));
      await openByClick(page, 'Renew passport');

      await expectNoAxeViolations();
    });
  });

  it('closes when the task is deleted on another device', async () => {
    const page = await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { tasks: { ImportantUrgent: ['Pay rent', 'Call the bank'] } },
    });
    await openByClick(page, 'Pay rent');

    page.cloud.remoteChange((server) => server.remove('Pay rent'));
    await act(async () => {});

    expect(
      screen.queryByRole('group', { name: /^Deadline for/ }),
    ).not.toBeInTheDocument();
    await select(page, 'Call the bank');
    expect(toolbar()).toHaveAccessibleName('Actions for “Call the bank”');
  });

  it('sets the deadline of a signed-in user without a network', async () => {
    const page = await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { tasks: { ImportantUrgent: ['Pay rent'] } },
    });
    page.cloud.goOffline();

    await openByKey(page, 'Pay rent');
    await page.user.keyboard('m');

    expect(card('Pay rent')).toHaveAccessibleName(/DUE SOON/);
    expect(page.cloud.serverTask('Pay rent').dueDate).toBeUndefined();

    page.cloud.goOnline();

    expect(page.cloud.serverTask('Pay rent')).toMatchObject({
      dueDate: day(26),
      hasDueTime: false,
    });
  });
});

describe('Deadline choices during a drag', () => {
  let layoutSpy: jest.SpyInstance;

  beforeEach(() => {
    layoutSpy = mockQuadrantLayout();
  });

  afterEach(() => {
    layoutSpy.mockRestore();
  });

  it('close without saving when a drag starts', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByClick(page, 'Renew passport');

    await dragOver('Renew passport', 'ImportantNotUrgent');

    expect(
      screen.queryByRole('group', { name: /^Deadline for/ }),
    ).not.toBeInTheDocument();

    fireEvent.mouseUp(document, centerOf('ImportantNotUrgent'));
    await act(async () => {});

    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');
  });
});
