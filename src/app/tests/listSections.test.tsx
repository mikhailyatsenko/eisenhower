import { act, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TITLES = ['Do First', 'Schedule', 'Delegate', 'Eliminate'];

const TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  ImportantNotUrgent: ['Plan the quarter'],
  NotImportantUrgent: ['Answer emails', 'Book the flights', 'Order toner'],
};

const DO_FIRST_EXAMPLE = 'e.g. Server is down, tax return due tomorrow';
const ELIMINATE_EXAMPLE =
  'e.g. Endless scrolling, reorganizing files nobody opens';

type Page = Awaited<ReturnType<typeof renderHomePage>>;

const openList = async (page: Page) => {
  await page.user.click(screen.getByRole('tab', { name: 'List' }));
  return page;
};

const section = (title: string) => screen.getByRole('listbox', { name: title });

const tasksIn = (title: string) =>
  within(section(title))
    .getAllByRole('option')
    .map((option) => option.textContent);

const toggle = (name: string | RegExp) => screen.getByRole('button', { name });

describe('List view sections', () => {
  it('reads the matrix from top to bottom: four sections, tasks in quadrant order', async () => {
    await openList(await renderHomePage({ tasks: TASKS }));

    expect(screen.getAllByRole('listbox')).toEqual(TITLES.map(section));
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent),
    ).toEqual(TITLES.map((title) => expect.stringContaining(title)));
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(tasksIn('Schedule')).toEqual(['Plan the quarter']);
    expect(tasksIn('Delegate')).toEqual([
      'Answer emails',
      'Book the flights',
      'Order toner',
    ]);
  });

  it('has no sort controls', async () => {
    await openList(await renderHomePage({ tasks: TASKS }));

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText(/sort by/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/order:/i)).not.toBeInTheDocument();
  });

  it('names each section header button by its title and task count', async () => {
    await openList(await renderHomePage({ tasks: TASKS }));

    const doFirst = toggle('Do First, 2 tasks');
    expect(doFirst).toHaveAttribute('aria-expanded', 'true');
    expect(doFirst).toHaveAttribute('aria-controls', section('Do First').id);
    expect(doFirst).toHaveAccessibleDescription('Important & urgent');
    expect(
      within(
        screen.getByRole('heading', { level: 2, name: /^Do First/ }),
      ).getByRole('button'),
    ).toBe(doFirst);
    expect(toggle('Schedule, 1 task')).toBeInTheDocument();
    expect(toggle('Delegate, 3 tasks')).toBeInTheDocument();
  });

  it('collapses a section on a click on its header and keeps it after a reload', async () => {
    const page = await openList(await renderHomePage({ tasks: TASKS }));

    await page.user.click(toggle('Do First, 2 tasks'));

    expect(toggle('Do First, 2 tasks')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.queryByRole('listbox', { name: 'Do First' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();
    expect(tasksIn('Schedule')).toEqual(['Plan the quarter']);

    await page.reload();

    expect(toggle('Do First, 2 tasks')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.queryByRole('listbox', { name: 'Do First' }),
    ).not.toBeInTheDocument();

    await page.user.click(toggle('Do First, 2 tasks'));

    expect(toggle('Do First, 2 tasks')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
  });

  it('collapses with Enter and Space from the keyboard', async () => {
    const page = await openList(await renderHomePage({ tasks: TASKS }));

    toggle('Schedule, 1 task').focus();
    await page.user.keyboard('{Enter}');
    expect(toggle('Schedule, 1 task')).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await page.user.keyboard(' ');
    expect(toggle('Schedule, 1 task')).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows an empty section open, with the example and "Click to add a task" and no toggle', async () => {
    await openList(await renderHomePage({ tasks: TASKS }));

    const heading = screen.getByRole('heading', { name: /Eliminate/ });
    expect(within(heading).queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Eliminate/ }),
    ).not.toBeInTheDocument();
    expect(section('Eliminate')).toBeInTheDocument();
    expect(screen.getByText(ELIMINATE_EXAMPLE)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Click to add a task' }),
    ).toHaveAccessibleDescription('Eliminate');
  });

  it('says "Tap to add" in an empty section on a touch screen', async () => {
    await openList(
      await renderHomePage({
        tasks: TASKS,
        viewport: { width: 390, pointer: 'coarse' },
      }),
    );

    expect(screen.getByRole('button', { name: 'Tap to add' })).toBeVisible();
    expect(screen.getAllByRole('listbox')).toEqual(TITLES.map(section));
  });

  it("brings a stored collapse back with the section's first task", async () => {
    const page = await openList(
      await renderHomePage({ tasks: { ImportantNotUrgent: ['Plan'] } }),
    );
    await page.user.click(toggle('Schedule, 1 task'));

    // Emptied from the matrix: the section opens and shows its example
    await page.user.click(screen.getByRole('tab', { name: 'Matrix' }));
    await page.user.click(screen.getByText('Plan'));
    await page.user.keyboard('{Delete}');
    await page.user.click(screen.getByRole('tab', { name: 'List' }));

    expect(section('Schedule')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Schedule/ }),
    ).not.toBeInTheDocument();

    await page.user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(toggle('Schedule, 1 task')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.queryByRole('listbox', { name: 'Schedule' }),
    ).not.toBeInTheDocument();
  });

  it('shows the matrix card with its deadline line', async () => {
    await openList(
      await renderHomePage({
        tasks: {
          ImportantUrgent: [
            {
              id: 'rent',
              text: 'Pay rent',
              createdAt: new Date('2026-09-20T10:00:00Z'),
              dueDate: new Date('2020-01-06T00:00:00'),
              hasDueTime: false,
            },
          ],
        },
      }),
    );

    expect(
      within(section('Do First')).getByRole('option', { name: /Pay rent/ }),
    ).toHaveAccessibleName(/^Pay rent OVERDUE .*2020/);
  });

  it('acts on a task through the action panel, not buttons on the card', async () => {
    const page = await openList(await renderHomePage({ tasks: TASKS }));

    const rent = within(section('Do First')).getByRole('option', {
      name: 'Pay rent',
    });
    expect(within(rent).queryByRole('button')).not.toBeInTheDocument();

    await page.user.click(rent);
    expect(rent).toHaveAttribute('aria-selected', 'true');

    await page.user.click(
      within(
        screen.getByRole('toolbar', { name: 'Actions for “Pay rent”' }),
      ).getByRole('button', { name: /Complete/ }),
    );

    expect(tasksIn('Do First')).toEqual(['Call the bank']);
    expect(toggle('Do First, 1 task')).toBeInTheDocument();
  });
});

describe('List view sections, signed in', () => {
  const ADA = { uid: 'u1', displayName: 'Ada' };
  const SERVER_TASKS = { ImportantUrgent: ['Pay rent', 'Call the bank'] };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the cloud Matrix offline', async () => {
    await openList(
      await renderHomePage({
        signedIn: ADA,
        cloud: { tasks: SERVER_TASKS, deviceCache: 'warm', network: 'offline' },
      }),
    );

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(toggle('Do First, 2 tasks')).toBeInTheDocument();
  });

  it('shows no examples while the account is awaited', async () => {
    await openList(
      await renderHomePage({
        signedIn: ADA,
        cloud: {
          tasks: SERVER_TASKS,
          deviceCache: 'empty',
          network: 'offline',
        },
      }),
    );
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getAllByRole('listbox')).toHaveLength(4);
    expect(screen.queryByText(DO_FIRST_EXAMPLE)).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Click to add a task' }),
    ).toHaveLength(4);
  });
});

// axe waits on real timers
describe('List view sections accessibility', () => {
  it('has no axe violations with open, collapsed and empty sections', async () => {
    const page = await openList(await renderHomePage({ tasks: TASKS }));

    expect(await axe(document.body)).toHaveNoViolations();

    await page.user.click(toggle('Do First, 2 tasks'));

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations with a task selected', async () => {
    const page = await openList(await renderHomePage({ tasks: TASKS }));

    await page.user.click(screen.getByRole('option', { name: 'Pay rent' }));

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
