import { act, fireEvent, screen, within } from '@testing-library/react';
import { moveTask } from '@/features/undo';
import { Task } from '@/shared/stores/tasksStore';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = ['Alpha', 'Bravo', 'Charlie'];

const taskTexts = () =>
  screen
    .getAllByText(/^(Alpha|Bravo|Charlie)$/)
    .map((element) => element.textContent);

const toast = () => screen.getByRole('status', { name: 'Notifications' });

const undoButton = () => screen.getByRole('button', { name: 'Undo' });

const advance = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

/** Selects the task and presses an action in its toolbar */
const actOnTask = async (user: User, text: string, action: string) => {
  await user.click(screen.getByRole('option', { name: text }));
  await user.click(
    within(screen.getByRole('toolbar')).getByRole('button', { name: action }),
  );
};

const deleteTask = (user: User, text: string) =>
  actOnTask(user, text, 'Delete');

describe('Undo toast', () => {
  let confirm: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    // Nothing asks for confirmation up front: Undo replaces it
    expect(confirm).not.toHaveBeenCalled();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('deletes at once and restores the task to its position on Undo', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');

    expect(taskTexts()).toEqual(['Alpha', 'Charlie']);
    expect(toast()).toHaveTextContent('Task deleted');

    await user.click(undoButton());

    expect(taskTexts()).toEqual(TASKS);
    // No toast after Undo itself
    expect(toast()).toBeEmptyDOMElement();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toContainElement(screen.getByText('Bravo'));
  });

  it('completes a task with an Undo that brings it back in place', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await actOnTask(user, 'Alpha', 'Complete');

    expect(toast()).toHaveTextContent('Task completed');
    expect(toast()).not.toHaveTextContent(/successfully/i);

    await user.click(undoButton());

    expect(taskTexts()).toEqual(TASKS);
    expect(document.activeElement).toContainElement(screen.getByText('Alpha'));
  });

  it('deletes a completed task without confirm and restores it on Undo', async () => {
    const { user } = await renderHomePage({
      completedTasks: [
        {
          id: 'done-1',
          text: 'Old report',
          createdAt: new Date('2026-09-20T10:00:00.000Z'),
          completedAt: new Date('2026-09-21T10:00:00.000Z'),
          completed: true,
          quadrantKey: 'ImportantUrgent',
        },
      ],
    });

    await user.click(
      screen.getByRole('button', { name: /completed tasks \(1\)/i }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete permanently' }),
    );

    expect(screen.queryByText('Old report')).not.toBeInTheDocument();
    expect(toast()).toHaveTextContent('Task deleted');

    await user.click(undoButton());

    expect(screen.getByText('Old report')).toBeInTheDocument();
    expect(document.activeElement).toContainElement(
      screen.getByText('Old report'),
    );
  });

  it('replaces the previous toast, and Undo reverts only the last action', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    await deleteTask(user, 'Charlie');

    expect(screen.getAllByText('Task deleted')).toHaveLength(1);

    await user.click(undoButton());

    expect(taskTexts()).toEqual(['Bravo', 'Charlie']);
  });

  it('hides the toast after 6 seconds', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    await advance(5900);
    expect(toast()).toHaveTextContent('Task deleted');

    await advance(200);
    expect(toast()).toBeEmptyDOMElement();
  });

  it('holds the toast while hovered', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    await user.hover(screen.getByText('Task deleted'));
    await advance(10_000);
    expect(toast()).toHaveTextContent('Task deleted');

    await user.unhover(screen.getByText('Task deleted'));
    await advance(6100);
    expect(toast()).toBeEmptyDOMElement();
  });

  it('holds the toast while Undo has focus', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    act(() => undoButton().focus());
    await advance(10_000);

    expect(toast()).toHaveTextContent('Task deleted');
  });

  it('holds the toast while the user is on another tab', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    fireEvent.blur(window);
    await advance(10_000);
    expect(toast()).toHaveTextContent('Task deleted');

    fireEvent.focus(window);
    await advance(6100);
    expect(toast()).toBeEmptyDOMElement();
  });

  it('is not closed by Escape', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    await user.keyboard('{Escape}');

    expect(toast()).toHaveTextContent('Task deleted');
  });

  it('reaches Undo by Tab right after the matrix', async () => {
    const { user } = await renderHomePage({
      tasks: { NotImportantNotUrgent: ['Alpha', 'Bravo'] },
      completedTasks: [
        {
          id: 'done-1',
          text: 'Old report',
          createdAt: new Date('2026-09-20T10:00:00.000Z'),
          completed: true,
        },
      ],
    });

    await deleteTask(user, 'Alpha');
    const undo = undoButton();
    const completed = screen.getByRole('button', { name: /completed tasks/i });

    // Bravo is selected now: start from its toolbar at the end of the matrix
    act(() => {
      within(screen.getByRole('toolbar'))
        .getByRole('button', { name: 'Delete' })
        .focus();
    });
    // Past the rest of the matrix, Undo comes before the Completed section
    for (let i = 0; i < 10; i += 1) {
      if (undo === document.activeElement) break;
      expect(completed).not.toHaveFocus();
      await user.tab();
    }

    expect(undo).toHaveFocus();
  });

  it('adds a task silently', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.type(screen.getByRole('textbox'), 'Book the venue');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Book the venue')).toBeInTheDocument();
    expect(toast()).toBeEmptyDOMElement();
  });

  it('edits a task silently', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await actOnTask(user, 'Alpha', 'Edit');
    await user.type(screen.getByRole('textbox'), ' draft');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Alpha draft')).toBeInTheDocument();
    expect(toast()).toBeEmptyDOMElement();
  });
});

describe('Undo shortcut', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('undoes the last action on Ctrl+Z while the toast is shown', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');
    await user.keyboard('{Control>}z{/Control}');

    expect(taskTexts()).toEqual(TASKS);
    expect(toast()).toBeEmptyDOMElement();
    expect(document.activeElement).toContainElement(screen.getByText('Bravo'));
  });

  it('does nothing on Ctrl+Z once the toast is gone', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');
    await advance(6100);
    await user.keyboard('{Control>}z{/Control}');

    expect(taskTexts()).toEqual(['Alpha', 'Charlie']);
  });

  it('leaves Ctrl+Z to the text field being typed in', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');
    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.type(screen.getByRole('textbox'), 'Book');
    await user.keyboard('{Control>}z{/Control}');

    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    expect(toast()).toHaveTextContent('Task deleted');
  });

  it('leaves the task deleted while a dialog is open', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');
    await user.click(screen.getByRole('button', { name: /new task/i }));
    act(() => screen.getByRole('button', { name: 'Save' }).focus());
    await user.keyboard('{Control>}z{/Control}');

    expect(screen.getByRole('dialog', { name: 'New task' })).toBeVisible();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
  });

  it('announces the toast with its shortcut', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');

    expect(toast()).toHaveTextContent(/^Task deleted\. Undo with Ctrl\+Z$/);
  });

  it('shows the key next to Undo for a mouse', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
      viewport: { pointer: 'fine' },
    });

    await deleteTask(user, 'Bravo');

    expect(screen.getByText('Ctrl+Z')).toBeVisible();
  });

  it('hides the key hint on a touch screen', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
      viewport: { pointer: 'coarse' },
    });

    await deleteTask(user, 'Bravo');

    expect(undoButton()).toBeVisible();
    expect(screen.queryByText('Ctrl+Z')).not.toBeInTheDocument();
  });

  it('uses Cmd+Z and shows ⌘Z on macOS', async () => {
    jest.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Bravo');

    expect(toast()).toHaveTextContent(/^Task deleted\. Undo with ⌘Z$/);
    expect(screen.getByText('⌘Z')).toBeVisible();

    await user.keyboard('{Control>}z{/Control}');
    expect(taskTexts()).toEqual(['Alpha', 'Charlie']);

    await user.keyboard('{Meta>}z{/Meta}');
    expect(taskTexts()).toEqual(TASKS);
  });
});

const completed = (id: string, text: string): Task => ({
  id,
  text,
  createdAt: new Date('2026-09-20T10:00:00.000Z'),
  completedAt: new Date('2026-09-21T10:00:00.000Z'),
  completed: true,
  quadrantKey: 'ImportantNotUrgent',
});

/** Task texts in the quadrant with this title, top to bottom */
const tasksIn = (title: string) => {
  const quadrant = screen.getByRole('heading', { name: title }).parentElement!;
  return Array.from(quadrant.querySelectorAll('li')).map((card) =>
    TASKS.find((task) => within(card).queryByText(task)),
  );
};

describe('Undo for Move and Restore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves a task to another quadrant and puts it back in place on Undo', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await act(() =>
      moveTask('ImportantUrgent', 'ImportantUrgent-1', 'ImportantNotUrgent'),
    );

    expect(tasksIn('Do First')).toEqual(['Alpha', 'Charlie']);
    expect(tasksIn('Schedule')).toEqual(['Bravo']);
    expect(toast()).toHaveTextContent('Moved to Schedule');

    await user.click(undoButton());

    expect(tasksIn('Do First')).toEqual(TASKS);
    expect(tasksIn('Schedule')).toEqual([]);
    expect(toast()).toBeEmptyDOMElement();
    expect(document.activeElement).toContainElement(screen.getByText('Bravo'));
  });

  it('shows no toast when the task is already in that quadrant', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: TASKS } });

    await act(() =>
      moveTask('ImportantUrgent', 'ImportantUrgent-1', 'ImportantUrgent'),
    );

    expect(tasksIn('Do First')).toEqual(TASKS);
    expect(toast()).toBeEmptyDOMElement();
  });

  it('restores a completed task and returns it to Completed in place on Undo', async () => {
    const { user } = await renderHomePage({
      completedTasks: [
        completed('done-1', 'Alpha'),
        completed('done-2', 'Bravo'),
        completed('done-3', 'Charlie'),
      ],
    });

    await user.click(
      screen.getByRole('button', { name: /completed tasks \(3\)/i }),
    );
    const bravo = screen.getByText('Bravo').closest('li')!;
    await user.click(
      within(bravo).getByRole('button', { name: 'Restore task' }),
    );

    expect(toast()).toHaveTextContent('Restored to Schedule');
    expect(tasksIn('Schedule')).toEqual(['Bravo']);

    await user.click(undoButton());

    expect(tasksIn('Schedule')).toEqual([]);
    const completedList = screen.getByText('Alpha').closest('ul')!;
    expect(
      within(completedList)
        .getAllByText(/^(Alpha|Bravo|Charlie)$/)
        .map((element) => element.textContent),
    ).toEqual(TASKS);
    expect(document.activeElement).toContainElement(screen.getByText('Bravo'));
  });
});

describe('Undo toast accessibility', () => {
  it('has no axe violations while a toast is shown', async () => {
    const { user, container } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');

    expect(toast()).toHaveTextContent('Task deleted');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with a dialog over the toast', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await deleteTask(user, 'Alpha');
    await user.click(screen.getByRole('button', { name: /new task/i }));

    // The dialog is portalled to body, outside the render container
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
