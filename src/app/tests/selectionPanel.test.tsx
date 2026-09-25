import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = ['Alpha', 'Bravo', 'Charlie'];

const task = (text: string) => screen.getByRole('option', { name: text });

const toolbar = () => screen.getByRole('toolbar');

const queryToolbar = () => screen.queryByRole('toolbar');

const toast = () => screen.getByRole('status', { name: 'Notifications' });

const tasksIn = (title: string) =>
  within(screen.getByRole('listbox', { name: title }))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const selectedTasks = () =>
  screen
    .queryAllByRole('option', { selected: true })
    .map((option) => option.textContent);

describe('Selected Task', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows each quadrant as a listbox of task options', async () => {
    await renderHomePage({
      tasks: { ImportantUrgent: TASKS, NotImportantUrgent: ['Delta'] },
    });

    expect(tasksIn('Do First')).toEqual(TASKS);
    expect(tasksIn('Delegate')).toEqual(['Delta']);
    expect(task('Alpha')).toHaveAttribute('aria-selected', 'false');
  });

  it('selects a task on click and shows its action toolbar', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    expect(queryToolbar()).not.toBeInTheDocument();

    await user.click(task('Bravo'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
    expect(toolbar()).toHaveAccessibleName('Actions for “Bravo”');
    for (const name of ['Complete', 'Edit', 'Delete']) {
      expect(
        within(toolbar()).getByRole('button', { name }),
      ).toBeInTheDocument();
    }
  });

  it('keeps at most one task selected', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS, ImportantNotUrgent: ['Delta'] },
    });

    await user.click(task('Alpha'));
    await user.click(task('Delta'));

    expect(selectedTasks()).toEqual(['Delta']);
    expect(toolbar()).toHaveAccessibleName('Actions for “Delta”');
  });

  it('clears the selection on a second click', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(task('Bravo'));

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
  });

  it('clears the selection on a click on empty quadrant space', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(screen.getByRole('listbox', { name: 'Do First' }));

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
  });

  it('clears the selection on Escape', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('{Escape}');

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
  });

  it('opens the inline add field on a click in an empty quadrant', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(screen.getByRole('listbox', { name: 'Schedule' }));

    expect(
      screen.getByRole('textbox', { name: 'Add task to Schedule' }),
    ).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('only clears the selection on a click in an empty quadrant', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(screen.getByRole('listbox', { name: 'Schedule' }));

    expect(selectedTasks()).toEqual([]);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows only text and deadline on the card, links as plain text', async () => {
    await renderHomePage({
      tasks: {
        ImportantUrgent: [
          {
            id: 'task-1',
            text: 'Read https://example.com',
            createdAt: new Date('2026-09-20T10:00:00.000Z'),
            dueDate: new Date('2099-09-30T10:00:00.000Z'),
          },
        ],
      },
    });

    const card = screen.getByRole('option', { name: /Read/ });
    expect(within(card).queryByRole('button')).not.toBeInTheDocument();
    expect(within(card).queryByRole('link')).not.toBeInTheDocument();
    expect(card).toHaveTextContent('Read https://example.com');
    expect(card).toHaveTextContent(/in \d+ years/);
    // No creation date on the card
    expect(card).not.toHaveTextContent('20/09/2026');
  });
});

describe('Action toolbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves the task to another quadrant with Undo and selects the next one', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    const moveTo = within(toolbar()).getByRole('group', { name: 'Move to' });

    expect(
      within(moveTo).getByRole('button', { name: 'Do First' }),
    ).toBeDisabled();

    await user.click(within(moveTo).getByRole('button', { name: 'Schedule' }));

    expect(tasksIn('Do First')).toEqual(['Alpha', 'Charlie']);
    expect(tasksIn('Schedule')).toEqual(['Bravo']);
    expect(toast()).toHaveTextContent('Moved to Schedule');
    expect(selectedTasks()).toEqual(['Charlie']);
    expect(toolbar()).toHaveAccessibleName('Actions for “Charlie”');
    // The panel stays, and so does the focus on the pressed button
    expect(
      within(toolbar()).getByRole('button', { name: 'Schedule' }),
    ).toHaveFocus();
  });

  it('completes the task with Undo and selects the next one', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Alpha'));
    await user.click(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    );

    expect(tasksIn('Do First')).toEqual(['Bravo', 'Charlie']);
    expect(toast()).toHaveTextContent('Task completed');
    expect(selectedTasks()).toEqual(['Bravo']);
    expect(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    ).toHaveFocus();
  });

  it('selects the previous task after the last one is deleted', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Charlie'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Delete' }));

    expect(tasksIn('Do First')).toEqual(['Alpha', 'Bravo']);
    expect(toast()).toHaveTextContent('Task deleted');
    expect(selectedTasks()).toEqual(['Bravo']);
  });

  it('clears the selection once the quadrant is empty', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(task('Alpha'));
    await user.click(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    );

    expect(selectedTasks()).toEqual([]);
    expect(queryToolbar()).not.toBeInTheDocument();
  });

  it('selects the restored task on Undo', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Alpha'));
    await user.click(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    );
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(tasksIn('Do First')).toEqual(TASKS);
    expect(selectedTasks()).toEqual(['Alpha']);
    expect(task('Alpha')).toHaveFocus();
  });

  it('leaves Escape in the edit form to the form', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Edit' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(selectedTasks()).toEqual(['Bravo']);
  });

  it('opens the usual edit form and keeps the task in its quadrant', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantNotUrgent: ['Plan the quarter'] },
    });

    await user.click(task('Plan the quarter'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeVisible();

    await user.type(screen.getByRole('textbox'), ' ASAP');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(tasksIn('Schedule')).toEqual(['Plan the quarter ASAP']);
    expect(toast()).toBeEmptyDOMElement();
  });
});

describe('List view', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const openListView = async () => {
    const page = await renderHomePage({ tasks: { ImportantUrgent: TASKS } });
    await page.user.click(screen.getByRole('button', { name: /list view/i }));
    return page;
  };

  const listCard = (text: string) => screen.getByText(text).closest('li')!;

  it('still deletes a task with Undo from its card', async () => {
    const { user } = await openListView();

    await user.click(
      within(listCard('Bravo')).getByRole('button', { name: 'Delete task' }),
    );

    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    expect(toast()).toHaveTextContent('Task deleted');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  it('still completes a task with Undo from its card', async () => {
    const { user } = await openListView();

    await user.click(
      within(listCard('Alpha')).getByRole('button', {
        name: 'Mark as completed',
      }),
    );

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(toast()).toHaveTextContent('Task completed');
  });

  it('keeps the card buttons visible without hover', async () => {
    await openListView();

    const buttons = within(listCard('Alpha')).getAllByRole('button');
    buttons.forEach((button) => {
      expect(button.parentElement!.className).not.toMatch(/opacity-0/);
    });
  });
});

// axe waits on real timers
describe('Selection accessibility', () => {
  it('has no axe violations with a task selected', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations with the edit form open', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Edit' }));

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
