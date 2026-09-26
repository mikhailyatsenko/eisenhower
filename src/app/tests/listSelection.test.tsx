import { act, fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  ImportantNotUrgent: ['Plan the quarter'],
  NotImportantUrgent: ['Answer emails', 'Book the flights'],
  NotImportantNotUrgent: ['Tidy the desk'],
};

const PHONE = { width: 390, pointer: 'coarse' } as const;

const MOUSE_HINT =
  'Click a task to select it · ↑↓←→ move selection · ? all shortcuts';

type Page = Awaited<ReturnType<typeof renderHomePage>>;
type RenderOptions = Parameters<typeof renderHomePage>[0];

const openList = async (options: RenderOptions = { tasks: TASKS }) => {
  const page = await renderHomePage(options);
  await page.user.click(screen.getByRole('tab', { name: 'List' }));
  return page;
};

const task = (text: string) => screen.getByRole('option', { name: text });

const tasksIn = (title: string) =>
  within(screen.getByRole('listbox', { name: title }))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const selectedTasks = () =>
  screen
    .queryAllByRole('option', { selected: true })
    .map((option) => option.textContent);

/** The one task the keyboard reaches: selected and focused */
const expectCurrentTask = (text: string) => {
  expect(selectedTasks()).toEqual([text]);
  expect(task(text)).toHaveFocus();
};

const toggle = (name: string) => screen.getByRole('button', { name });

const toolbar = () => screen.getByRole('toolbar');
const queryToolbar = () => screen.queryByRole('toolbar');
const toolbarButton = (name: string | RegExp) =>
  within(toolbar()).getByRole('button', { name });

const toast = () => screen.getByRole('status', { name: 'Notifications' });

/** Tabs from the top of the page until focus is on a task, if ever */
const tabIntoList = async ({ user }: Page) => {
  (document.activeElement as HTMLElement | null)?.blur();
  for (let step = 0; step < 30; step++) {
    await user.tab();
    if (document.activeElement?.getAttribute('role') === 'option') return;
  }
};

describe('Selection in List view', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('selects a task on a click and opens the action panel, a second click clears it', async () => {
    const { user } = await openList();

    await user.click(task('Plan the quarter'));

    expect(task('Plan the quarter')).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('toolbar', { name: 'Actions for “Plan the quarter”' }),
    ).toBeVisible();

    await user.click(task('Plan the quarter'));

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
  });

  it('focuses the next task of the section after Complete, else the previous one', async () => {
    const { user } = await openList();

    await user.click(task('Pay rent'));
    await user.click(toolbarButton(/Complete/));

    // The panel stays for the next task, with the pressed button focused
    expect(tasksIn('Do First')).toEqual(['Call the bank']);
    expect(selectedTasks()).toEqual(['Call the bank']);
    expect(toolbarButton(/Complete/)).toHaveFocus();

    await user.click(task('Book the flights'));
    await user.keyboard('c');

    expectCurrentTask('Answer emails');
  });

  it('acts on the selected task with the matrix keys', async () => {
    const { user } = await openList();

    await user.click(task('Answer emails'));
    await user.keyboard('{Delete}');

    expect(tasksIn('Delegate')).toEqual(['Book the flights']);
    expect(toast()).toHaveTextContent('Task deleted');
    expectCurrentTask('Book the flights');

    await user.keyboard('{Control>}z{/Control}');

    expect(tasksIn('Delegate')).toEqual(['Answer emails', 'Book the flights']);
    expectCurrentTask('Answer emails');

    await user.keyboard('e');
    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeVisible();
    await user.keyboard('{Escape}');

    await user.keyboard('?');
    expect(
      screen.getByRole('dialog', { name: 'Keyboard shortcuts' }),
    ).toBeVisible();
  });

  it('moves the selected task on 2 and focuses the next task of its section', async () => {
    const { user } = await openList();

    await user.click(task('Pay rent'));
    await user.keyboard('2');

    expect(tasksIn('Schedule')).toEqual(['Plan the quarter', 'Pay rent']);
    expect(toast()).toHaveTextContent('Moved to Schedule');
    expectCurrentTask('Call the bank');
  });

  it('moves a task into a collapsed section and leaves it collapsed', async () => {
    const { user } = await openList();

    await user.click(toggle('Schedule, 1 task'));
    await user.click(task('Pay rent'));
    await user.keyboard('2');

    expect(toggle('Schedule, 2 tasks')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.queryByRole('listbox', { name: 'Schedule' }),
    ).not.toBeInTheDocument();
    expect(toast()).toHaveTextContent('Moved to Schedule');

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
  });

  it('clears the selection when its section collapses and keeps the focus on the header', async () => {
    const { user } = await openList();

    await user.click(task('Plan the quarter'));
    await user.click(toggle('Schedule, 1 task'));

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
    expect(toggle('Schedule, 1 task')).toHaveFocus();
  });

  it('clears the selection on "×", Escape and a click on the page', async () => {
    const { user } = await openList();

    await user.click(task('Pay rent'));
    await user.click(toolbarButton('Deselect task'));

    expect(selectedTasks()).toEqual([]);
    expect(task('Pay rent')).toHaveFocus();

    await user.click(task('Pay rent'));
    await user.keyboard('{Escape}');

    expect(selectedTasks()).toEqual([]);
    expect(task('Pay rent')).toHaveFocus();

    await user.click(task('Pay rent'));
    await user.click(screen.getByRole('contentinfo'));

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
  });
});

describe('Keys in List view', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('makes the list one Tab stop on the first task of the first open section', async () => {
    const page = await openList();
    await page.user.click(toggle('Do First, 2 tasks'));

    const tabStops = screen
      .getAllByRole('option')
      .filter((option) => option.tabIndex === 0);
    expect(tabStops).toEqual([task('Plan the quarter')]);

    await tabIntoList(page);

    expectCurrentTask('Plan the quarter');
  });

  it('comes back to the last selected task on Tab while it shows', async () => {
    const page = await openList();

    await page.user.click(task('Book the flights'));
    await page.user.keyboard('{Escape}');
    await tabIntoList(page);

    expectCurrentTask('Book the flights');

    await page.user.keyboard('{Escape}');
    await page.user.click(toggle('Delegate, 2 tasks'));
    await tabIntoList(page);

    expectCurrentTask('Pay rent');
  });

  it('walks the tasks across sections on ArrowDown and ArrowUp, without wrapping', async () => {
    const { user } = await openList();

    await user.click(task('Call the bank'));
    await user.keyboard('{ArrowDown}');
    expectCurrentTask('Plan the quarter');

    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expectCurrentTask('Pay rent');

    await user.click(task('Tidy the desk'));
    await user.keyboard('{ArrowDown}');
    expectCurrentTask('Tidy the desk');
  });

  it('skips a collapsed section on the arrows', async () => {
    const { user } = await openList();

    await user.click(toggle('Schedule, 1 task'));
    await user.click(task('Call the bank'));
    await user.keyboard('{ArrowDown}');
    expectCurrentTask('Answer emails');

    await user.keyboard('{ArrowLeft}');
    expectCurrentTask('Pay rent');
  });

  it('goes to the first task of the next or previous section on ArrowRight and ArrowLeft', async () => {
    const { user } = await openList();

    await user.click(task('Call the bank'));
    await user.keyboard('{ArrowRight}');
    expectCurrentTask('Plan the quarter');

    await user.keyboard('{ArrowRight}{ArrowRight}');
    expectCurrentTask('Tidy the desk');

    await user.keyboard('{ArrowRight}');
    expectCurrentTask('Tidy the desk');

    await user.keyboard('{ArrowLeft}');
    expectCurrentTask('Answer emails');
  });

  it('selects the first task on ArrowDown with nothing selected', async () => {
    const { user } = await openList();

    await user.click(toggle('Do First, 2 tasks'));
    act(() => (document.activeElement as HTMLElement).blur());
    await user.keyboard('{ArrowDown}');

    expectCurrentTask('Plan the quarter');
  });

  it('leaves the arrows, Enter and Space on a section header to the header', async () => {
    const { user } = await openList();

    toggle('Schedule, 1 task').focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');

    expect(selectedTasks()).toEqual([]);
    expect(toggle('Schedule, 1 task')).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(toggle('Schedule, 1 task')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

describe('List view hint line and drag', () => {
  it('shows the selection hint under the list', async () => {
    await openList();

    expect(screen.getByText(MOUSE_HINT)).toBeVisible();
  });

  it('has no drag: the card is not draggable and a mouse drag starts nothing', async () => {
    await openList();

    const card = task('Pay rent');
    expect(card).not.toHaveAttribute('aria-roledescription');

    fireEvent.mouseDown(card, { clientX: 0, clientY: 0, button: 0 });
    await act(async () => {});
    fireEvent.mouseMove(document, { clientX: 40, clientY: 200 });
    await act(async () => {});

    // A drag would show the card's copy under the pointer
    expect(screen.getAllByText('Pay rent')).toHaveLength(1);
    fireEvent.mouseUp(document);
  });

  it('opens the phone panel and says "Tap a task to select it" on a phone', async () => {
    const { user } = await openList({ tasks: TASKS, viewport: PHONE });

    expect(screen.getByText('Tap a task to select it')).toBeVisible();

    await user.click(task('Pay rent'));

    expect(
      within(toolbar())
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([
      '×',
      'Complete',
      'Edit',
      'Delete',
      'Do First',
      'Schedule',
      'Delegate',
      'Eliminate',
    ]);
  });

  it('has no axe violations with the panel open', async () => {
    const { user } = await openList({ tasks: TASKS, viewport: PHONE });

    await user.click(task('Plan the quarter'));

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
