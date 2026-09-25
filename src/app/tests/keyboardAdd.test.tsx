import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const list = (title: string) => screen.getByRole('listbox', { name: title });

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const field = (title: string) =>
  screen.getByRole('textbox', { name: `Add task to ${title}` });

const queryFields = () =>
  screen.queryAllByRole('textbox', { name: /^Add task to/ });

/** An empty quadrant's own button, described by the quadrant's title */
const addATask = (title: string) =>
  screen.getByRole('button', {
    name: 'Click to add a task',
    description: title,
  });

const queryAddATask = () =>
  screen.queryAllByRole('button', { name: 'Click to add a task' });

const task = (text: string) => screen.getByRole('option', { name: text });

const selectedTasks = () =>
  screen
    .queryAllByRole('option', { selected: true })
    .map((option) => option.textContent);

const expectCurrentTask = (text: string) => {
  expect(selectedTasks()).toEqual([text]);
  expect(task(text)).toHaveFocus();
};

type Page = Awaited<ReturnType<typeof renderHomePage>>;

/** Tabs from the top of the page until focus is in the matrix, if ever */
const tabIntoMatrix = async ({ user }: Page) => {
  (document.activeElement as HTMLElement | null)?.blur();
  const matrix = screen.getByRole('group', { name: 'Task matrix' });
  for (let step = 0; step < 30; step++) {
    await user.tab();
    if (matrix.contains(document.activeElement)) return;
  }
};

describe('Adding from the keyboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the field, not the add form, on N and 2 with nothing selected', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantNotUrgent: ['Delta'] },
    });

    await user.keyboard('n');

    expect(field('Do First')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Escape}2');

    expect(field('Schedule')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('Echo{Enter}');

    expect(tasksIn('Schedule')).toEqual(['Delta', 'Echo']);
  });

  it('opens the field on N in the quadrant of the last selection', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'], NotImportantUrgent: ['Charlie'] },
    });

    await user.click(task('Charlie'));
    await user.keyboard('{Escape}n');

    expect(field('Delegate')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the field on N in the selected task’s quadrant and Escape comes back to the task', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'], ImportantNotUrgent: ['Bravo'] },
    });

    await user.click(task('Bravo'));
    await user.keyboard('n');

    expect(field('Schedule')).toHaveFocus();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(queryFields()).toEqual([]);
    expectCurrentTask('Bravo');
  });

  it('gives the focus back to where it was on Escape from a field opened by 1–4', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha', 'Bravo'] },
    });

    await user.click(task('Bravo'));
    await user.keyboard('{Escape}');
    expect(task('Bravo')).toHaveFocus();

    await user.keyboard('3');
    expect(field('Delegate')).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(task('Bravo')).toHaveFocus();
  });

  it('still moves the selected task on 1–4', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha', 'Bravo'] },
    });

    await user.click(task('Alpha'));
    await user.keyboard('2');

    expect(tasksIn('Schedule')).toEqual(['Alpha']);
    expect(queryFields()).toEqual([]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Add a task in an empty quadrant', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows in empty quadrants only, out of the Tab order while the matrix has tasks', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Alpha'] } });

    expect(queryAddATask()).toHaveLength(3);
    for (const title of ['Schedule', 'Delegate', 'Eliminate']) {
      expect(addATask(title)).toHaveAttribute('tabindex', '-1');
    }
  });

  it.each([
    ['Enter', '{Enter}'],
    ['Space', '[Space]'],
    ['N', 'n'],
  ])('opens the field on %s, and Escape comes back to it', async (_, key) => {
    const page = await renderHomePage();

    await tabIntoMatrix(page);
    await page.user.keyboard(key);

    expect(field('Do First')).toHaveFocus();
    expect(field('Do First')).toHaveValue('');

    await page.user.keyboard('{Escape}');

    expect(queryFields()).toEqual([]);
    expect(addATask('Do First')).toHaveFocus();
  });

  it('gives way to the tasks added: Escape goes to the last one', async () => {
    const page = await renderHomePage();

    await tabIntoMatrix(page);
    await page.user.keyboard('{Enter}Alpha{Enter}Bravo{Enter}{Escape}');

    expect(tasksIn('Do First')).toEqual(['Alpha', 'Bravo']);
    expect(queryAddATask()).toHaveLength(3);
    expectCurrentTask('Bravo');
  });

  it('opens the field on a click', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(task('Alpha'));
    await user.click(addATask('Delegate'));

    expect(field('Delegate')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
  });

  it('takes the focus on → into an empty quadrant, with no action panel', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha', 'Bravo'] },
    });

    await user.click(task('Bravo'));
    await user.keyboard('{ArrowRight}');

    expect(addATask('Schedule')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    // The matrix is still one Tab stop, now on the button
    const tabStops = [
      ...screen.getAllByRole('option'),
      ...queryAddATask(),
    ].filter((element) => element.tabIndex === 0);
    expect(tabStops).toEqual([addATask('Schedule')]);

    await user.keyboard('{ArrowLeft}');

    expectCurrentTask('Alpha');
  });

  it('crosses between empty quadrants on ← and →, and ↑ ↓ stay put', async () => {
    const page = await renderHomePage();

    await tabIntoMatrix(page);
    await page.user.keyboard('{ArrowRight}');
    expect(addATask('Schedule')).toHaveFocus();

    await page.user.keyboard('{ArrowRight}{ArrowDown}{ArrowUp}');
    expect(addATask('Schedule')).toHaveFocus();

    await page.user.keyboard('{ArrowLeft}');
    expect(addATask('Do First')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
  });

  it('takes the focus after Complete of the quadrant’s last task, and Undo brings the task back', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'], ImportantNotUrgent: ['Bravo'] },
    });

    await user.click(task('Alpha'));
    await user.keyboard('c');

    expect(tasksIn('Do First')).toEqual([]);
    expect(addATask('Do First')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    await user.keyboard('{Control>}z{/Control}');

    expect(tasksIn('Do First')).toEqual(['Alpha']);
    expectCurrentTask('Alpha');
  });
});

describe('Add a task and axe', () => {
  it('has no axe violations with empty quadrants and with the focus on one', async () => {
    const { user, container } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    expect(await axe(container)).toHaveNoViolations();

    await user.click(task('Alpha'));
    await user.keyboard('{ArrowRight}');

    expect(await axe(container)).toHaveNoViolations();
  });
});
