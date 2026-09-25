import { screen, within } from '@testing-library/react';
import type { Task } from '@/shared/stores/tasksStore';
import { list } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  NotImportantUrgent: ['Reply to the landlord'],
};

const DONE: Task = {
  id: 'done-1',
  text: 'File taxes',
  createdAt: new Date('2026-09-20T10:00:00.000Z'),
  completedAt: new Date('2026-09-21T10:00:00.000Z'),
  completed: true,
  quadrantKey: 'ImportantNotUrgent',
};

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const toolbar = () => screen.getByRole('toolbar');

const toast = () => screen.getByRole('status', { name: 'Notifications' });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

/** Selects the task, unless the last action already passed the selection to it */
const select = async (user: User, text: string) => {
  const option = screen.getByRole('option', { name: text });
  if (option.getAttribute('aria-selected') !== 'true') await user.click(option);
};

/** Selects the task and presses an action in its toolbar */
const actOnTask = async (user: User, text: string, action: string) => {
  await select(user, text);
  await user.click(within(toolbar()).getByRole('button', { name: action }));
};

const moveTask = async (user: User, text: string, quadrant: string) => {
  await select(user, text);
  await user.click(
    within(within(toolbar()).getByRole('group', { name: 'Move to' })).getByRole(
      'button',
      { name: quadrant },
    ),
  );
};

const openCompleted = (user: User) =>
  user.click(screen.getByRole('button', { name: /completed tasks/i }));

const offlinePage = () =>
  renderHomePage({
    signedIn: ADA,
    cloud: { tasks: SERVER_TASKS, completedTasks: [DONE], network: 'offline' },
  });

describe('Changes of a signed-in user without a network', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('closes the add form after the first Enter and adds the task once', async () => {
    const { user, cloud } = await offlinePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('Buy milk{Enter}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'Buy milk' })).toHaveLength(1);

    cloud.goOnline();

    expect(Object.values(cloud.serverTasks()).flat()).toContain('Buy milk');
    expect(screen.getAllByRole('option', { name: 'Buy milk' })).toHaveLength(1);
  });

  it('shows an edit at once', async () => {
    const { user } = await offlinePage();

    await actOnTask(user, 'Pay rent', 'Edit');
    await user.type(screen.getByRole('textbox'), ' today');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(['Pay rent today', 'Call the bank']);
  });

  it('moves, completes and deletes at once, each with its toast', async () => {
    const { user } = await offlinePage();

    await moveTask(user, 'Pay rent', 'Schedule');
    expect(tasksIn('Schedule')).toEqual(['Pay rent']);
    expect(toast()).toHaveTextContent('Moved to Schedule');

    await actOnTask(user, 'Call the bank', 'Complete');
    expect(tasksIn('Do First')).toEqual([]);
    expect(toast()).toHaveTextContent('Task completed');

    await actOnTask(user, 'Reply to the landlord', 'Delete');
    expect(tasksIn('Delegate')).toEqual([]);
    expect(toast()).toHaveTextContent('Task deleted');

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(tasksIn('Delegate')).toEqual(['Reply to the landlord']);
  });

  it('restores a completed task at once', async () => {
    const { user } = await offlinePage();

    await openCompleted(user);
    await user.click(screen.getByRole('button', { name: 'Restore task' }));

    expect(tasksIn('Schedule')).toEqual(['File taxes']);
  });

  it('keeps the changes through a reload and sends them once back online', async () => {
    const { user, cloud, reload } = await offlinePage();

    await openCompleted(user);
    await user.click(screen.getByRole('button', { name: 'Restore task' }));
    await moveTask(user, 'Pay rent', 'Schedule');
    await actOnTask(user, 'Call the bank', 'Complete');
    await actOnTask(user, 'Reply to the landlord', 'Delete');
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    await reload();

    expect(tasksIn('Do First')).toEqual([]);
    expect(tasksIn('Schedule')).toEqual(['File taxes', 'Pay rent']);
    expect(tasksIn('Delegate')).toEqual(['Reply to the landlord']);
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Pay rent', 'Call the bank'],
      completed: ['File taxes'],
    });

    cloud.goOnline();

    expect(cloud.serverTasks()).toEqual({
      ImportantUrgent: [],
      ImportantNotUrgent: ['File taxes', 'Pay rent'],
      NotImportantUrgent: ['Reply to the landlord'],
      NotImportantNotUrgent: [],
      completed: ['Call the bank'],
    });
  });

  it('leaves a task changed on another device alone when moving another', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.goOffline();
    cloud.remoteChange((server) =>
      server.rename('Reply to the landlord', 'Reply to the landlord by Friday'),
    );

    await moveTask(user, 'Pay rent', 'Schedule');
    cloud.goOnline();

    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Call the bank'],
      ImportantNotUrgent: ['Pay rent'],
      NotImportantUrgent: ['Reply to the landlord by Friday'],
    });
    expect(tasksIn('Delegate')).toEqual(['Reply to the landlord by Friday']);
  });

  it('clears Completed on the server once back online', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { user, cloud } = await offlinePage();
    await actOnTask(user, 'Pay rent', 'Complete');

    await openCompleted(user);
    await user.click(screen.getByRole('button', { name: 'delete all' }));

    expect(
      screen.queryByRole('button', { name: /completed tasks/i }),
    ).not.toBeInTheDocument();

    cloud.goOnline();

    expect(cloud.serverTasks().completed).toEqual([]);
    expect(cloud.serverTasks().ImportantUrgent).toEqual(['Call the bank']);
  });

  it('copies the local tasks to the cloud and switches to it at once', async () => {
    const { user, cloud } = await renderHomePage({
      tasks: { ImportantUrgent: ['Local only'] },
      signedIn: ADA,
      cloud: { network: 'offline' },
    });
    await user.click(screen.getByRole('button', { name: 'Ada' }));
    await user.click(screen.getByText('Local Matrix'));

    await user.click(
      screen.getByRole('button', { name: 'Copy all tasks to Cloud' }),
    );

    expect(toast()).toHaveTextContent('All local tasks copied to cloud');
    expect(
      screen.queryByRole('button', { name: 'Copy all tasks to Cloud' }),
    ).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(['Local only']);

    cloud.goOnline();

    expect(cloud.serverTasks().ImportantUrgent).toEqual(['Local only']);
  });
});
