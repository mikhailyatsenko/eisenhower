import { screen, within } from '@testing-library/react';
import { formatDate } from '@/shared/lib/formatDate';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

// Friday 25 September 2026, 9:30 local time
const FRIDAY = new Date(2026, 8, 25, 9, 30);

const PHONE = { width: 390, pointer: 'coarse' } as const;

const ADA = { uid: 'u1', displayName: 'Ada' };

const TASKS = {
  ImportantUrgent: ['Pay rent'],
  ImportantNotUrgent: ['Plan the week'],
};

const day = (date: number, hours = 0, minutes = 0) =>
  new Date(2026, 8, date, hours, minutes);

/** The date as the card and Add show it, in the test's (Node's) locale */
const shown = (date: Date, hasTime = false) =>
  formatDate(date, { hasTime, now: FRIDAY });

const list = (title: string) => screen.getByRole('listbox', { name: title });

const cardsIn = (title: string) => within(list(title)).queryAllByRole('option');

const lastCardIn = (title: string) => cardsIn(title).at(-1)!;

const field = (title: string) =>
  screen.getByRole('textbox', { name: `Add task to ${title}` });

const queryFields = () =>
  screen.queryAllByRole('textbox', { name: /^Add task to/ });

const strip = (title: string) =>
  screen.getByRole('group', { name: `Deadline for the new task in ${title}` });

const queryStrip = () =>
  screen.queryByRole('group', { name: /^Deadline for the new task/ });

const chip = (title: string, name: string | RegExp) =>
  within(strip(title)).getByRole('button', { name });

const addButton = (title: string) =>
  within(strip(title)).getByRole('button', { name: /^Add/ });

/** Last in a test: axe waits on real timers, so the clock runs from here on */
const expectNoAxeViolations = async () => {
  jest.useRealTimers();
  expect(await axe(document.body)).toHaveNoViolations();
};

describe('Deadline strip while adding a task', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: FRIDAY });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the strip instead of the action panel while the field is open', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    expect(screen.getByRole('toolbar')).toBeInTheDocument();

    // N opens the field: the selection goes, and the panel with it
    await user.keyboard('n');

    expect(field('Do First')).toHaveFocus();
    expect(strip('Do First')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(queryStrip()).not.toBeInTheDocument();
  });

  it('opens with the chips, the date, + Time and a disabled Add without deadline', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2');

    expect(field('Schedule')).toHaveFocus();
    expect(
      within(strip('Schedule'))
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-pressed')),
    ).toEqual(['false', 'false', 'false', 'true', null, null]);
    expect(
      within(strip('Schedule')).queryByRole('button', { name: /^Today/ }),
    ).not.toBeInTheDocument();
    expect(chip('Schedule', /^Tomorrow/)).toBeInTheDocument();
    expect(chip('Schedule', /^This weekend/)).toBeInTheDocument();
    expect(chip('Schedule', /^Next week/)).toBeInTheDocument();
    expect(chip('Schedule', /^No deadline/)).toBeInTheDocument();
    expect(within(strip('Schedule')).getByLabelText('Date')).toHaveValue('');
    expect(chip('Schedule', '+ Time')).toBeInTheDocument();
    expect(
      within(strip('Schedule')).queryByRole('button', { name: 'Set' }),
    ).not.toBeInTheDocument();
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
    expect(addButton('Schedule')).toBeDisabled();
  });

  it('adds with a chip from the keyboard: Tab, M, Enter', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2');
    await user.keyboard('Book flights');
    expect(addButton('Schedule')).toBeEnabled();

    await user.tab();
    expect(chip('Schedule', /^No deadline/)).toHaveFocus();
    expect(field('Schedule')).toHaveValue('Book flights');

    await user.keyboard('m');
    expect(field('Schedule')).toHaveFocus();
    expect(chip('Schedule', /^Tomorrow/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(addButton('Schedule')).toHaveAccessibleName(
      `Add · ${shown(day(26))}`,
    );

    await user.keyboard('{Enter}');

    expect(lastCardIn('Schedule')).toHaveAccessibleName(
      /^Book flights.*DUE SOON/,
    );
    expect(lastCardIn('Schedule')).toHaveTextContent(shown(day(26)));
    expect(field('Schedule')).toHaveValue('');
    expect(field('Schedule')).toHaveFocus();
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
    expect(chip('Schedule', /^No deadline/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryAllByRole('option', { selected: true })).toEqual([]);
  });

  it('picks the other chips by their keys, Delete for none', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.tab();
    // No Today chip, no T
    await user.keyboard('t');
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
    await user.keyboard('w');
    expect(addButton('Schedule')).toHaveAccessibleName(
      `Add · ${shown(day(26))}`,
    );

    await user.tab();
    // Saturday 26 is tomorrow too: Tomorrow, the first pressed chip
    expect(chip('Schedule', /^Tomorrow/)).toHaveFocus();
    await user.keyboard('x');
    expect(addButton('Schedule')).toHaveAccessibleName(
      `Add · ${shown(day(28))}`,
    );

    await user.tab();
    await user.keyboard('{Delete}');
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
    expect(field('Schedule')).toHaveFocus();
    expect(field('Schedule')).toHaveValue('Book flights');
  });

  it('adds with a clicked chip and Add, and the focus goes back to the field', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('Book flights');
    await user.click(chip('Schedule', /^This weekend/));

    expect(field('Schedule')).toHaveFocus();
    expect(addButton('Schedule')).toHaveAccessibleName(
      `Add · ${shown(day(26))}`,
    );

    await user.click(addButton('Schedule'));

    expect(lastCardIn('Schedule')).toHaveAccessibleName(
      /^Book flights.*DUE SOON/,
    );
    expect(field('Schedule')).toHaveValue('');
    expect(field('Schedule')).toHaveFocus();
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
  });

  it('adds without a deadline from Add as from Enter', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.click(addButton('Schedule'));

    expect(lastCardIn('Schedule')).toHaveAccessibleName('Book flights');
  });

  it('applies a date at once and adds on Enter in the date field', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    const date = within(strip('Schedule')).getByLabelText('Date');
    await user.type(date, '2026-10-02');

    expect(date).toHaveFocus();
    expect(addButton('Schedule')).toHaveAccessibleName(
      `Add · ${shown(day(32))}`,
    );

    await user.keyboard('{Enter}');

    expect(lastCardIn('Schedule')).toHaveAccessibleName(/^Book flights/);
    expect(lastCardIn('Schedule')).toHaveTextContent(shown(day(32)));
    expect(field('Schedule')).toHaveValue('');
    expect(field('Schedule')).toHaveFocus();
  });

  it('does not add on Enter in the date field while the text is empty', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2');
    await user.type(
      within(strip('Schedule')).getByLabelText('Date'),
      '2026-10-02{Enter}',
    );

    expect(cardsIn('Schedule')).toHaveLength(1);
  });

  it('sets today at 9:00 with + Time and no date', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.click(chip('Schedule', '+ Time'));

    const time = within(strip('Schedule')).getByLabelText('Time');
    expect(time).toHaveValue('09:00');
    expect(time).toHaveFocus();
    expect(within(strip('Schedule')).getByLabelText('Date')).toHaveValue(
      '2026-09-25',
    );
    expect(addButton('Schedule')).toHaveAccessibleName(
      `Add · ${shown(day(25, 9), true)}`,
    );

    await user.keyboard('{Enter}');

    expect(lastCardIn('Schedule')).toHaveTextContent(shown(day(25, 9), true));
  });

  it('goes back to the field on Esc and Shift+Tab, and the field stays open', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.tab();
    await user.keyboard('{Escape}');

    expect(field('Schedule')).toHaveFocus();
    expect(field('Schedule')).toHaveValue('Book flights');

    // Tomorrow, the first element of the strip
    await user.click(chip('Schedule', /^Tomorrow/));
    await user.tab();
    expect(chip('Schedule', /^Tomorrow/)).toHaveFocus();
    await user.tab({ shift: true });

    expect(field('Schedule')).toHaveFocus();
    expect(field('Schedule')).toHaveValue('Book flights');
  });

  it('leaves the matrix keys alone in the strip', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.tab();
    await user.keyboard('1n?c');

    expect(field('Schedule')).toHaveValue('Book flights');
    expect(queryFields()).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps an empty field open for the strip and closes it once the focus leaves both', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.tab();

    expect(chip('Schedule', /^No deadline/)).toHaveFocus();
    expect(field('Schedule')).toBeInTheDocument();

    // A click on the strip itself keeps it too
    await user.click(chip('Schedule', /^Tomorrow/));
    expect(field('Schedule')).toHaveFocus();
    expect(field('Schedule')).toBeInTheDocument();

    await user.tab();
    await user.click(document.body);

    expect(queryFields()).toEqual([]);
    expect(queryStrip()).not.toBeInTheDocument();
  });

  it('moves the text and the deadline with the field to another quadrant', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.tab();
    await user.keyboard('m');
    await user.click(list('Delegate'));

    expect(field('Delegate')).toHaveValue('Book flights');
    expect(field('Delegate')).toHaveFocus();
    expect(queryFields()).toHaveLength(1);
    expect(addButton('Delegate')).toHaveAccessibleName(
      `Add · ${shown(day(26))}`,
    );

    await user.keyboard('{Enter}');

    expect(lastCardIn('Delegate')).toHaveAccessibleName(
      /^Book flights.*DUE SOON/,
    );
  });

  it('starts without a deadline after Esc and a new open', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.tab();
    await user.keyboard('m');
    await user.keyboard('{Escape}');
    expect(queryFields()).toEqual([]);

    await user.keyboard('2');

    expect(field('Schedule')).toHaveValue('');
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
    expect(chip('Schedule', /^No deadline/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('adds on Enter in the time field', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.click(chip('Schedule', /^Tomorrow/));
    await user.click(chip('Schedule', '+ Time'));
    await user.keyboard('{Enter}');

    expect(lastCardIn('Schedule')).toHaveTextContent(shown(day(26, 9), true));
    expect(field('Schedule')).toHaveFocus();
  });

  it('moves the deadline with the field to another quadrant by its +', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.click(chip('Schedule', /^Tomorrow/));
    await user.click(
      screen.getByRole('button', { name: 'Add a task to Delegate' }),
    );

    expect(field('Delegate')).toHaveValue('Book flights');
    expect(addButton('Delegate')).toHaveAccessibleName(
      `Add · ${shown(day(26))}`,
    );
  });

  it('starts without a deadline after a view switch', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.click(chip('Schedule', /^Tomorrow/));
    await user.click(screen.getByRole('tab', { name: 'List' }));
    expect(queryStrip()).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Add a task to Schedule' }),
    );

    expect(field('Schedule')).toHaveValue('');
    expect(addButton('Schedule')).toHaveAccessibleName('Add without deadline');
  });

  it('adds with a deadline in a List view section', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });
    await user.click(screen.getByRole('tab', { name: 'List' }));

    await user.click(
      screen.getByRole('button', { name: 'Add a task to Schedule' }),
    );
    await user.keyboard('Book flights');
    await user.click(chip('Schedule', /^Tomorrow/));
    await user.keyboard('{Enter}');

    expect(lastCardIn('Schedule')).toHaveAccessibleName(
      /^Book flights.*DUE SOON/,
    );
    expect(field('Schedule')).toHaveFocus();
    await expectNoAxeViolations();
  });

  it('adds with a deadline for a signed-in user without a network', async () => {
    const page = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: { ImportantUrgent: ['Pay rent'] } },
    });
    page.cloud.goOffline();

    await page.user.keyboard('2Book flights');
    await page.user.tab();
    await page.user.keyboard('m{Enter}');

    expect(lastCardIn('Schedule')).toHaveAccessibleName(
      /^Book flights.*DUE SOON/,
    );
    expect(page.cloud.serverTasks().ImportantNotUrgent).toEqual([]);

    page.cloud.goOnline();

    expect(page.cloud.serverTasks().ImportantNotUrgent).toEqual([
      'Book flights',
    ]);
    expect(page.cloud.serverTask('Book flights')).toMatchObject({
      dueDate: day(26),
      hasDueTime: false,
    });
  });

  it('has no axe violations with the strip in the matrix', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('2Book flights');
    await user.tab();
    await user.keyboard('m');

    await expectNoAxeViolations();
  });

  describe('on a phone', () => {
    const deadlineToggle = (title: string) =>
      within(strip(title)).getByRole('button', { name: 'Deadline' });

    it('shows the quadrant full screen and the strip folded to one line with Add', async () => {
      const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

      await user.click(list('Schedule'));
      await user.keyboard('Book flights');

      expect(screen.getAllByRole('listbox')).toHaveLength(1);
      expect(
        within(strip('Schedule'))
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toEqual(['Deadline', 'Add without deadline']);
      expect(deadlineToggle('Schedule')).toHaveAttribute(
        'aria-expanded',
        'false',
      );

      await user.click(addButton('Schedule'));

      expect(lastCardIn('Schedule')).toHaveAccessibleName('Book flights');
      expect(field('Schedule')).toHaveFocus();
    });

    it('unfolds the chips and the date, and a chip folds them back', async () => {
      const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

      await user.click(list('Schedule'));
      await user.keyboard('Book flights');
      await user.click(deadlineToggle('Schedule'));

      expect(deadlineToggle('Schedule')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      // The focus stays in the field: the keyboard stays up
      expect(field('Schedule')).toHaveFocus();
      expect(chip('Schedule', /^Tomorrow/)).toHaveAccessibleName('Tomorrow');
      expect(within(strip('Schedule')).getByLabelText('Date')).toBeVisible();

      await user.click(chip('Schedule', /^Tomorrow/));

      expect(deadlineToggle('Schedule')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(addButton('Schedule')).toHaveAccessibleName(
        `Add · ${shown(day(26))}`,
      );
      expect(field('Schedule')).toHaveFocus();

      await user.click(addButton('Schedule'));

      expect(lastCardIn('Schedule')).toHaveAccessibleName(
        /^Book flights.*DUE SOON/,
      );
      await expectNoAxeViolations();
    });

    it('starts folded on each open of the field', async () => {
      const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

      await user.click(list('Schedule'));
      await user.click(deadlineToggle('Schedule'));
      await user.click(
        screen.getByRole('button', { name: 'Add a task to Schedule' }),
      );

      expect(deadlineToggle('Schedule')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('picks a deadline by its key from the folded strip', async () => {
      const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

      await user.click(list('Schedule'));
      await user.keyboard('Book flights');
      await user.tab();

      expect(deadlineToggle('Schedule')).toHaveFocus();

      await user.keyboard('m');

      expect(field('Schedule')).toHaveFocus();
      expect(addButton('Schedule')).toHaveAccessibleName(
        `Add · ${shown(day(26))}`,
      );
    });

    it('has no axe violations with the strip in List view', async () => {
      const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });
      await user.click(screen.getByRole('tab', { name: 'List' }));

      await user.click(
        screen.getByRole('button', { name: 'Add a task to Schedule' }),
      );

      expect(strip('Schedule')).toBeInTheDocument();
      await expectNoAxeViolations();
    });
  });
});
