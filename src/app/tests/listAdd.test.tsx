import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  ImportantNotUrgent: ['Plan the quarter'],
  NotImportantUrgent: ['Answer emails'],
};

const HINT = 'click empty space to add';

type RenderOptions = Parameters<typeof renderHomePage>[0];

const openList = async (options: RenderOptions = { tasks: TASKS }) => {
  const page = await renderHomePage(options);
  await page.user.click(screen.getByRole('tab', { name: 'List' }));
  return page;
};

const section = (title: string) => screen.getByRole('listbox', { name: title });

const tasksIn = (title: string) =>
  within(section(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const task = (text: string) => screen.getByRole('option', { name: text });

const selectedTasks = () =>
  screen
    .queryAllByRole('option', { selected: true })
    .map((option) => option.textContent);

const field = (title: string) =>
  screen.getByRole('textbox', { name: `Add task to ${title}` });

const queryFields = () =>
  screen.queryAllByRole('textbox', { name: /^Add task to/ });

const plus = (title: string) =>
  screen.getByRole('button', { name: `Add a task to ${title}` });

const toggle = (name: string) => screen.getByRole('button', { name });

const addTaskButton = (title: string) =>
  screen.getByRole('button', {
    name: 'Click to add a task',
    description: title,
  });

const toolbarButton = (name: RegExp) =>
  within(screen.getByRole('toolbar')).getByRole('button', { name });

describe('Adding in a List view section', () => {
  it('opens the field on a click on empty space, adds last on Enter and keeps the field', async () => {
    const { user } = await openList();

    await user.click(section('Schedule'));

    expect(field('Schedule')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('Hire a designer{Enter}');

    expect(tasksIn('Schedule')).toEqual([
      'Plan the quarter',
      'Hire a designer',
    ]);
    expect(field('Schedule')).toHaveValue('');
    expect(field('Schedule')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
  });

  it('puts the focus on the section’s + on Escape after a click on empty space', async () => {
    const { user } = await openList();

    await user.click(section('Do First'));
    await user.keyboard('{Escape}');

    expect(queryFields()).toEqual([]);
    expect(plus('Do First')).toHaveFocus();
  });

  it('only clears the selection on the first click on empty space', async () => {
    const { user } = await openList();

    await user.click(task('Pay rent'));
    await user.click(section('Schedule'));

    expect(selectedTasks()).toEqual([]);
    expect(queryFields()).toEqual([]);

    await user.click(section('Schedule'));

    expect(field('Schedule')).toHaveFocus();
  });

  it('opens the field from the + in the header, out of the Tab order, and Esc comes back to it', async () => {
    const { user } = await openList();

    for (const title of ['Do First', 'Schedule', 'Delegate', 'Eliminate']) {
      expect(plus(title)).toHaveAttribute('tabindex', '-1');
    }

    await user.click(plus('Delegate'));

    expect(field('Delegate')).toHaveFocus();

    await user.keyboard('Order toner{Escape}');

    expect(queryFields()).toEqual([]);
    expect(tasksIn('Delegate')).toEqual(['Answer emails']);
    expect(plus('Delegate')).toHaveFocus();
  });

  it('keeps one field on the page: its text moves to another section', async () => {
    const { user } = await openList();

    await user.click(section('Schedule'));
    await user.keyboard('Order toner');
    await user.click(plus('Delegate'));

    expect(queryFields()).toEqual([field('Delegate')]);
    expect(field('Delegate')).toHaveValue('Order toner');
  });

  it('opens the field in an empty section from "Click to add a task"', async () => {
    const { user } = await openList();

    await user.click(addTaskButton('Eliminate'));
    await user.keyboard('Tidy the desk{Enter}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tasksIn('Eliminate')).toEqual(['Tidy the desk']);
    expect(field('Eliminate')).toHaveFocus();
  });

  it('opens the field on 2 with nothing selected', async () => {
    const { user } = await openList();

    await user.keyboard('2');

    expect(field('Schedule')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the field on N in the section of the selected task, and Esc comes back to the task', async () => {
    const { user } = await openList();

    await user.click(task('Answer emails'));
    await user.keyboard('n');

    expect(field('Delegate')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);

    await user.keyboard('{Escape}');

    expect(task('Answer emails')).toHaveFocus();
  });

  it('expands a collapsed section for the field on N, and it stays expanded', async () => {
    const { user, reload } = await openList();

    await user.click(toggle('Do First, 2 tasks'));
    await user.keyboard('n');

    expect(toggle('Do First, 2 tasks')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(field('Do First')).toHaveFocus();

    await reload();

    expect(toggle('Do First, 2 tasks')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('expands a collapsed section for the field on its +', async () => {
    const { user } = await openList();

    await user.click(toggle('Schedule, 1 task'));
    await user.click(plus('Schedule'));

    expect(toggle('Schedule, 1 task')).toHaveAttribute('aria-expanded', 'true');
    expect(field('Schedule')).toHaveFocus();
  });

  it('closes the field when its section collapses', async () => {
    const { user } = await openList();

    await user.click(section('Schedule'));
    await user.keyboard('Order toner');
    await user.click(toggle('Schedule, 1 task'));

    expect(queryFields()).toEqual([]);

    await user.click(plus('Delegate'));

    expect(field('Delegate')).toHaveValue('');
  });

  it('adds offline for a signed-in user, and the task reaches the server later', async () => {
    const { user, cloud } = await openList({
      signedIn: ADA,
      cloud: { tasks: { ImportantUrgent: ['Pay rent'] } },
    });

    cloud.goOffline();
    await user.click(section('Schedule'));
    await user.type(field('Schedule'), 'Buy milk{Enter}');

    expect(tasksIn('Schedule')).toEqual(['Buy milk']);
    expect(cloud.serverTasks().ImportantNotUrgent).toEqual([]);

    cloud.goOnline();

    expect(cloud.serverTasks().ImportantNotUrgent).toEqual(['Buy milk']);
  });

  it('passes axe with the field open', async () => {
    const { user, container } = await openList();

    await user.click(section('Schedule'));
    await user.type(field('Schedule'), 'Order toner');

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('An empty section’s "Add a task" in List view', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('takes the focus when the section’s last task is completed', async () => {
    const { user } = await openList();

    await user.click(task('Plan the quarter'));
    await user.click(toolbarButton(/Complete/));

    expect(addTaskButton('Schedule')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
  });

  it('is a stop of the arrows between the tasks', async () => {
    const { user } = await openList({
      tasks: { ImportantUrgent: ['Pay rent'], NotImportantUrgent: ['Answer'] },
    });

    await user.click(task('Pay rent'));
    await user.keyboard('{ArrowDown}');

    expect(addTaskButton('Schedule')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);

    await user.keyboard('{ArrowDown}');

    expect(selectedTasks()).toEqual(['Answer']);
    expect(task('Answer')).toHaveFocus();

    await user.keyboard('{ArrowLeft}');

    expect(addTaskButton('Schedule')).toHaveFocus();
  });

  it('is the Tab stop of a list with no tasks', async () => {
    const { user } = await openList({ tasks: {} });

    (document.activeElement as HTMLElement | null)?.blur();
    for (let step = 0; step < 30; step++) {
      await user.tab();
      if (document.activeElement === addTaskButton('Do First')) break;
    }

    expect(addTaskButton('Do First')).toHaveFocus();
    const tabStops = screen
      .getAllByRole('button', { name: 'Click to add a task' })
      .filter((button) => button.tabIndex === 0);
    expect(tabStops).toEqual([addTaskButton('Do First')]);
  });
});

describe('The hint "click empty space to add" in List view', () => {
  const hints = () => screen.queryAllByText(HINT);

  it('is in the header of every open section with a mouse', async () => {
    const { user } = await openList();

    expect(hints()).toHaveLength(4);

    await user.click(toggle('Do First, 2 tasks'));

    expect(hints()).toHaveLength(3);
  });

  it('is not there with a touch screen or narrower than 640px', async () => {
    const { setViewport } = await openList({
      tasks: TASKS,
      viewport: { pointer: 'coarse' },
    });

    expect(hints()).toHaveLength(0);

    await setViewport({ pointer: 'fine', width: 639 });

    expect(hints()).toHaveLength(0);
  });

  it('goes for good once a task is added by a click on empty space', async () => {
    const { user, reload } = await openList();

    await user.click(section('Schedule'));
    await user.keyboard('Order toner{Enter}');

    expect(hints()).toHaveLength(0);

    await reload();

    expect(hints()).toHaveLength(0);
  });
});
