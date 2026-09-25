import { act, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { list } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
};

const NOT_SAVED = "Some changes couldn't be saved to your account.";

const OFFLINE =
  "You're offline. Changes are saved on this device and will sync when you're back online.";

const syncBar = () => screen.getByRole('status', { name: 'Sync status' });

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const reloadButton = () =>
  within(screen.getByRole('alert')).getByRole('button', { name: 'Reload' });

const advance = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const addTask = async (user: User, text: string) => {
  await user.click(screen.getByRole('button', { name: /new task/i }));
  await user.keyboard(`${text}{Enter}`);
};

const completeTask = async (user: User, text: string) => {
  await user.click(screen.getByRole('option', { name: text }));
  await user.click(
    within(screen.getByRole('toolbar')).getByRole('button', {
      name: 'Complete',
    }),
  );
};

describe('Sync error of a signed-in user', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('says a refused change was not saved, and takes it off the screen', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.rejectNextWrite('permission-denied');
    await addTask(user, 'Buy milk');
    await advance(0);

    expect(screen.getByRole('alert')).toHaveTextContent(NOT_SAVED);
    expect(reloadButton()).toBeVisible();
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(cloud.serverTasks().ImportantUrgent).toEqual([
      'Pay rent',
      'Call the bank',
    ]);
  });

  it('puts a task back where it was when completing it is refused', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.rejectNextWrite('permission-denied');
    await completeTask(user, 'Pay rent');
    await advance(0);

    expect(screen.getByRole('alert')).toHaveTextContent(NOT_SAVED);
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
  });

  it('takes the place of the neutral bar and leaves the focus alone', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, network: 'offline' },
    });
    cloud.rejectNextWrite('permission-denied');
    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    await user.keyboard('4');
    expect(tasksIn('Eliminate')).toEqual(['Pay rent']);
    const focused = document.activeElement;

    cloud.goOnline();
    await advance(0);

    expect(screen.getByRole('alert')).toHaveTextContent(NOT_SAVED);
    expect(syncBar()).toBeEmptyDOMElement();
    expect(tasksIn('Eliminate')).toEqual([]);
    expect(document.activeElement).toBe(focused);
  });

  it('stays until the user reloads, whatever the network does', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.rejectNextWrite('permission-denied');
    await addTask(user, 'Buy milk');
    await advance(0);

    cloud.goOffline();
    cloud.goOnline();
    await advance(15_000);

    expect(screen.getByRole('alert')).toHaveTextContent(NOT_SAVED);
  });

  it('reloads the Matrix from the server and hides on its first answer', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.rejectNextWrite('permission-denied');
    await addTask(user, 'Buy milk');
    await advance(0);
    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    cloud.remoteChange((server) =>
      server.add('ImportantUrgent', 'From the phone'),
    );

    cloud.goOffline();
    await user.click(reloadButton());
    await advance(0);
    // No answer from the server yet
    expect(screen.getByRole('alert')).toHaveTextContent(NOT_SAVED);

    cloud.goOnline();
    await advance(0);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(syncBar()).toBeEmptyDOMElement();
    expect(tasksIn('Do First')).toEqual([
      'Pay rent',
      'Call the bank',
      'From the phone',
    ]);
    expect(screen.getByRole('option', { name: 'Pay rent' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // The button is gone: focus goes to the selected task, not to <body>
    expect(document.activeElement).toContainElement(
      screen.getByText('Pay rent'),
    );
  });

  it('keeps the focus on the page when Reload goes with nothing selected', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.failSubscription('permission-denied');

    reloadButton().focus();
    await user.keyboard('{Enter}');
    await advance(0);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('says so when the subscription fails, and Reload brings the Matrix back', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.failSubscription('permission-denied');

    expect(screen.getByRole('alert')).toHaveTextContent(NOT_SAVED);
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);

    cloud.remoteChange((server) =>
      server.add('ImportantUrgent', 'From the phone'),
    );
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);

    await user.click(reloadButton());
    await advance(0);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual([
      'Pay rent',
      'Call the bank',
      'From the phone',
    ]);
  });

  it('never shows up for a lost network or a silent server', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.goOffline();
    await addTask(user, 'Buy milk');
    await advance(15_000);
    expect(syncBar()).toHaveTextContent(OFFLINE);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    cloud.stall();
    await addTask(user, 'Call mom');
    await advance(15_000);
    expect(syncBar()).toHaveTextContent(OFFLINE);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    cloud.goOnline();
    await advance(15_000);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(cloud.serverTasks().ImportantUrgent).toEqual([
      'Pay rent',
      'Call the bank',
      'Buy milk',
      'Call mom',
    ]);
  });
});

// axe waits on real timers
describe('Sync error accessibility', () => {
  it('has no axe violations while the error shows', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.rejectNextWrite('permission-denied');
    await addTask(user, 'Buy milk');

    expect(await screen.findByRole('alert')).toHaveTextContent(NOT_SAVED);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
