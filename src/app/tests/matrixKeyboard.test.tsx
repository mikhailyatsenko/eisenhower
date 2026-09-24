import { act, fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = ['Alpha', 'Bravo', 'Charlie'];

const task = (text: string) => screen.getByRole('option', { name: text });

const toolbar = () => screen.getByRole('toolbar');

const queryToolbar = () => screen.queryByRole('toolbar');

const toast = () => screen.getByRole('status', { name: 'Notifications' });

const matrix = () => screen.getByRole('group', { name: 'Task matrix' });

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

type Page = Awaited<ReturnType<typeof renderHomePage>>;

/** Tabs from the top of the page until focus lands on a task, if ever */
const tabIntoMatrix = async ({ user }: Page) => {
  (document.activeElement as HTMLElement | null)?.blur();
  for (let step = 0; step < 30; step++) {
    await user.tab();
    if (document.activeElement?.getAttribute('role') === 'option') return;
  }
};

/** Fills the open add form and saves it */
const addTask = async ({ user }: Page, text: string) => {
  const dialog = screen.getByRole('dialog', { name: 'New task' });
  await user.type(within(dialog).getByRole('textbox'), text);
  await user.click(within(dialog).getByRole('button', { name: 'Save' }));
};

describe('Matrix Tab stop', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('makes the matrix one Tab stop that selects the first Do First task', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: TASKS, ImportantNotUrgent: ['Delta'] },
    });

    const tabStops = screen
      .getAllByRole('option')
      .filter((option) => option.tabIndex === 0);
    expect(tabStops).toEqual([task('Alpha')]);

    await tabIntoMatrix(page);

    expectCurrentTask('Alpha');
  });

  it('starts from the first non-empty quadrant when Do First is empty', async () => {
    const page = await renderHomePage({
      tasks: { NotImportantUrgent: ['Delta', 'Echo'] },
    });

    await tabIntoMatrix(page);

    expectCurrentTask('Delta');
  });

  it('comes back to the last selected task', async () => {
    const page = await renderHomePage({ tasks: { ImportantUrgent: TASKS } });

    await page.user.click(task('Charlie'));
    await page.user.keyboard('{Escape}');
    expect(selectedTasks()).toEqual([]);

    await tabIntoMatrix(page);

    expectCurrentTask('Charlie');
  });

  it('leaves the task by Tab for the action toolbar, and Escape brings it back', async () => {
    const page = await renderHomePage({ tasks: { ImportantUrgent: TASKS } });

    await tabIntoMatrix(page);
    await page.user.tab();

    expect(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    ).toHaveFocus();

    await page.user.keyboard('{Escape}');

    expectCurrentTask('Alpha');
  });

  it('has no Tab stop in an empty matrix', async () => {
    await renderHomePage();

    expect(screen.queryAllByRole('option')).toEqual([]);
    expect(matrix()).toHaveAttribute('tabindex', '-1');
  });
});

describe('Matrix keys without a selection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('selects the first task on ArrowDown', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantNotUrgent: ['Delta'], NotImportantUrgent: ['Echo'] },
    });

    await user.keyboard('{ArrowDown}');

    expectCurrentTask('Delta');
  });

  it('comes back to the task left focused by Escape on ArrowDown', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Charlie'));
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    expect(selectedTasks()).toEqual([]);

    await user.keyboard('{ArrowDown}');

    expectCurrentTask('Charlie');
  });

  it('does nothing on the other task keys', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.keyboard('{ArrowUp}{ArrowLeft}{ArrowRight}c{Delete}e');

    expect(selectedTasks()).toEqual([]);
    expect(tasksIn('Do First')).toEqual(TASKS);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the add form in quadrant N on 1–4, once', async () => {
    const page = await renderHomePage({ tasks: { ImportantUrgent: TASKS } });

    await page.user.keyboard('3');
    expect(screen.getAllByRole('dialog', { name: 'New task' })).toHaveLength(1);

    await addTask(page, 'Answer emails');

    expect(tasksIn('Delegate')).toEqual(['Answer emails']);
    expect(tasksIn('Do First')).toEqual(TASKS);
  });

  it('opens the add form in Do First on N', async () => {
    const page = await renderHomePage({
      tasks: { ImportantNotUrgent: ['Delta'] },
    });

    await page.user.keyboard('n');
    await addTask(page, 'Fix the server');

    expect(tasksIn('Do First')).toEqual(['Fix the server']);
  });

  it('keeps only 1–4 in List view', async () => {
    const page = await renderHomePage({ tasks: { ImportantUrgent: TASKS } });
    await page.user.click(screen.getByRole('button', { name: /list view/i }));

    await page.user.keyboard('n{ArrowDown}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await page.user.keyboard('2');

    expect(screen.getByRole('dialog', { name: 'New task' })).toBeVisible();
  });
});

describe('Matrix keys with a selection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const GRID = {
    ImportantUrgent: ['A1', 'A2', 'A3'],
    ImportantNotUrgent: ['B1', 'B2'],
    NotImportantUrgent: ['C1'],
  };

  it('walks the quadrant on ArrowDown and ArrowUp without wrapping', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A1'));
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expectCurrentTask('A3');

    await user.keyboard('{ArrowDown}');
    expectCurrentTask('A3');

    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expectCurrentTask('A1');
  });

  it('crosses to the next quadrant in the row on ArrowRight and ArrowLeft', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A2'));
    await user.keyboard('{ArrowRight}');
    expectCurrentTask('B2');

    // Right of the right column there's nothing
    await user.keyboard('{ArrowRight}');
    expectCurrentTask('B2');

    await user.keyboard('{ArrowLeft}');
    expectCurrentTask('A2');
  });

  it('takes the last task when the neighbour quadrant is shorter', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A3'));
    await user.keyboard('{ArrowRight}');

    expectCurrentTask('B2');
  });

  it('skips an empty neighbour quadrant', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('C1'));
    await user.keyboard('{ArrowRight}');

    expectCurrentTask('C1');
  });

  it('moves the task on 1–4 and does nothing for its own quadrant', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A2'));
    await user.keyboard('1');

    expect(tasksIn('Do First')).toEqual(['A1', 'A2', 'A3']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('4');

    expect(tasksIn('Do First')).toEqual(['A1', 'A3']);
    expect(tasksIn('Eliminate')).toEqual(['A2']);
    expect(toast()).toHaveTextContent('Moved to Eliminate');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectCurrentTask('A3');
  });

  it.each(['c', ' '])('completes the task on %p', async (key) => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A1'));
    await user.keyboard(key === ' ' ? '[Space]' : key);

    expect(tasksIn('Do First')).toEqual(['A2', 'A3']);
    expect(toast()).toHaveTextContent('Task completed');
    expectCurrentTask('A2');
  });

  it.each(['e', '{Enter}'])('opens the edit form on %p', async (key) => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('B1'));
    await user.keyboard(key);

    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeVisible();
    expect(screen.getByRole('textbox')).toHaveValue('B1');
  });

  it.each(['{Delete}', '{Backspace}'])(
    'deletes the task on %p',
    async (key) => {
      const { user } = await renderHomePage({ tasks: GRID });

      await user.click(task('A3'));
      await user.keyboard(key);

      expect(tasksIn('Do First')).toEqual(['A1', 'A2']);
      expect(toast()).toHaveTextContent('Task deleted');
      expectCurrentTask('A2');
    },
  );

  it('opens the add form in the selected quadrant on N', async () => {
    const page = await renderHomePage({ tasks: GRID });

    await page.user.click(task('B1'));
    await page.user.keyboard('n');
    await addTask(page, 'Plan the quarter');

    expect(tasksIn('Schedule')).toEqual(['B1', 'B2', 'Plan the quarter']);
  });

  it('clears the selection on Escape and keeps the focus on the task', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('B1'));
    await user.keyboard('{Escape}');

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
    expect(task('B1')).toHaveFocus();
  });

  it('leaves Enter and Space on a toolbar button to the button', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A1'));
    within(toolbar()).getByRole('button', { name: 'Delete' }).focus();
    await user.keyboard('{Enter}');

    expect(tasksIn('Do First')).toEqual(['A2', 'A3']);
    expect(toast()).toHaveTextContent('Task deleted');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ignores the keys in a form field', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A1'));
    await user.keyboard('e');
    const field = screen.getByRole('textbox');
    await user.clear(field);
    await user.type(field, 'c 2n{ArrowDown}{Backspace}');

    expect(field).toHaveValue('c 2');
    expect(tasksIn('Do First')).toEqual(['A1', 'A2', 'A3']);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('takes the letters by physical key on a Cyrillic layout', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A1'));
    // С (KeyC) on the Russian layout
    await act(async () => {
      fireEvent.keyDown(task('A1'), { key: 'с', code: 'KeyC' });
    });

    expect(tasksIn('Do First')).toEqual(['A2', 'A3']);
    expect(toast()).toHaveTextContent('Task completed');
  });

  it('ignores the keys with Ctrl or Cmd held', async () => {
    const { user } = await renderHomePage({ tasks: GRID });

    await user.click(task('A1'));
    await user.keyboard('{Meta>}c{/Meta}{Control>}2{/Control}');

    expect(tasksIn('Do First')).toEqual(['A1', 'A2', 'A3']);
  });
});

describe('Focus after an action', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('goes to the neighbour quadrant after completing its last task', async () => {
    const { user } = await renderHomePage({
      tasks: {
        ImportantUrgent: ['Alpha'],
        ImportantNotUrgent: ['Bravo'],
        NotImportantUrgent: ['Charlie'],
      },
    });

    await user.click(task('Alpha'));
    await user.keyboard('c');

    expectCurrentTask('Bravo');
  });

  it('goes to the quadrant below when the one in the row is empty', async () => {
    const { user } = await renderHomePage({
      tasks: {
        ImportantNotUrgent: ['Bravo'],
        NotImportantNotUrgent: ['Delta'],
      },
    });

    await user.click(task('Bravo'));
    await user.keyboard('{Delete}');

    expectCurrentTask('Delta');
  });

  it('goes to the nearest quadrant after moving the last task of a quadrant', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'], NotImportantUrgent: ['Charlie'] },
    });

    await user.click(task('Alpha'));
    await user.keyboard('2');

    expect(tasksIn('Schedule')).toEqual(['Alpha']);
    expectCurrentTask('Charlie');
  });

  it('focuses the matrix once its last task is gone', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(task('Alpha'));
    await user.keyboard('{Delete}');

    expect(selectedTasks()).toEqual([]);
    expect(matrix()).toHaveFocus();
  });

  it('focuses the matrix once the last task is completed from the toolbar', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(task('Alpha'));
    await user.click(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    );

    expect(queryToolbar()).not.toBeInTheDocument();
    expect(matrix()).toHaveFocus();
  });

  it('keeps the moved task selected when nothing else is in the matrix', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(task('Alpha'));
    await user.keyboard('3');

    expect(tasksIn('Delegate')).toEqual(['Alpha']);
    expectCurrentTask('Alpha');
  });

  it('keeps the moved task selected after the toolbar Move', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(task('Alpha'));
    await user.click(
      within(toolbar()).getByRole('button', { name: 'Delegate' }),
    );

    expect(tasksIn('Delegate')).toEqual(['Alpha']);
    expectCurrentTask('Alpha');
  });

  it('selects and focuses the restored task on Undo', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('c');
    expectCurrentTask('Charlie');

    await user.keyboard('{Control>}z{/Control}');

    expect(tasksIn('Do First')).toEqual(TASKS);
    expectCurrentTask('Bravo');
  });

  it.each([
    ['Delete', '{Delete}'],
    ['Move', '2'],
  ])('selects and focuses the restored task on Undo of %s', async (_, key) => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard(key);
    await user.keyboard('{Control>}z{/Control}');

    expect(tasksIn('Do First')).toEqual(TASKS);
    expectCurrentTask('Bravo');
  });
});

describe('Key hints in the toolbar', () => {
  it('shows each button’s key on desktop', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Alpha'));
    const button = (name: string) =>
      within(toolbar()).getByRole('button', { name });

    expect(button('Complete')).toHaveAttribute('aria-keyshortcuts', 'C');
    expect(button('Edit')).toHaveAttribute('aria-keyshortcuts', 'E');
    expect(button('Delete')).toHaveAttribute('aria-keyshortcuts', 'Delete');
    expect(button('Schedule')).toHaveAttribute('aria-keyshortcuts', '2');
    // No hint on the current quadrant: its digit does nothing
    expect(toolbar().querySelectorAll('kbd')).toHaveLength(6);
  });

  it('hides the key hints on a touch screen', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
      viewport: { pointer: 'coarse', width: 390 },
    });

    await user.click(task('Alpha'));

    expect(toolbar().querySelectorAll('kbd')).toHaveLength(0);
  });

  it('has no axe violations with the key hints shown', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Alpha'));

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
