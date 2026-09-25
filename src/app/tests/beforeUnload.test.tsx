import { act, screen } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
};

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const addTask = async (user: User, text: string) => {
  await user.click(screen.getByRole('button', { name: /new task/i }));
  await user.keyboard(`${text}{Enter}`);
};

/** Whether closing or reloading the tab now makes the browser ask first */
const warnsOnLeave = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

describe('Closing the tab', () => {
  it('warns a signed-in user while changes wait for the cloud', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    expect(warnsOnLeave()).toBe(false);

    cloud.goOffline();
    await addTask(user, 'Buy milk');

    expect(warnsOnLeave()).toBe(true);
  });

  it('closes quietly once the server has confirmed the changes', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, network: 'offline' },
    });
    await addTask(user, 'Buy milk');
    expect(warnsOnLeave()).toBe(true);

    cloud.goOnline();
    await act(async () => {});

    expect(cloud.serverTasks().ImportantUrgent).toContain('Buy milk');
    expect(warnsOnLeave()).toBe(false);
  });

  it('never warns an anonymous user', async () => {
    const { user, cloud } = await renderHomePage({
      tasks: { ImportantUrgent: ['Pay rent'] },
    });

    cloud.goOffline();
    await addTask(user, 'Buy milk');

    expect(screen.getByRole('option', { name: 'Buy milk' })).toBeVisible();
    expect(warnsOnLeave()).toBe(false);
  });
});
