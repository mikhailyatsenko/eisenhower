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

const OFFLINE =
  "You're offline. Changes are saved on this device and will sync when you're back online.";

const IN_ACCOUNT =
  "Your tasks are in your account. They'll appear when you're back online.";

const syncBar = () => screen.getByRole('status', { name: 'Sync status' });

const matrix = () => screen.queryByRole('group', { name: 'Task matrix' });

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const advance = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const addTask = async (user: User, text: string) => {
  await user.click(screen.getByRole('button', { name: /new task/i }));
  await user.keyboard(`${text}{Enter}`);
};

describe('First visit on a device without a network', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the Matrix, the offline bar and where the tasks are', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'offline' },
    });

    expect(matrix()).toBeInTheDocument();
    expect(syncBar()).toHaveTextContent(OFFLINE);
    expect(screen.getByText(IN_ACCOUNT)).toBeVisible();
  });

  it('lets the user add a task, and brings the server tasks back online', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'offline' },
    });

    await addTask(user, 'Buy milk');
    expect(tasksIn('Do First')).toEqual(['Buy milk']);
    expect(screen.getByText(IN_ACCOUNT)).toBeVisible();

    cloud.goOnline();
    await advance(0);

    expect(screen.queryByText(IN_ACCOUNT)).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(
      expect.arrayContaining(['Pay rent', 'Call the bank', 'Buy milk']),
    );
    expect(cloud.serverTasks().ImportantUrgent).toEqual(
      expect.arrayContaining(['Pay rent', 'Call the bank', 'Buy milk']),
    );
  });

  it('keeps the loader while the server is silent, then says where the tasks are after 10 s', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'stalled' },
    });

    await advance(9_900);
    expect(matrix()).not.toBeInTheDocument();

    await advance(100);
    expect(matrix()).toBeInTheDocument();
    expect(syncBar()).toHaveTextContent(OFFLINE);
    expect(screen.getByText(IN_ACCOUNT)).toBeVisible();

    cloud.goOnline();
    await advance(0);

    expect(screen.queryByText(IN_ACCOUNT)).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(syncBar()).toBeEmptyDOMElement();
  });

  it('keeps the Matrix on screen when the network comes back before the server answers', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'offline' },
    });
    await addTask(user, 'Buy milk');

    cloud.stall();
    await advance(0);

    expect(matrix()).toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(['Buy milk']);
    expect(screen.getByText(IN_ACCOUNT)).toBeVisible();
  });

  it('says nothing about the account on a device used before', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'warm', network: 'offline' },
    });

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(screen.queryByText(IN_ACCOUNT)).not.toBeInTheDocument();
  });

  it('shows no bar on a device used before while the server is silent', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'warm', network: 'stalled' },
    });

    await advance(15_000);

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(syncBar()).toBeEmptyDOMElement();
    expect(screen.queryByText(IN_ACCOUNT)).not.toBeInTheDocument();
  });

  it('says nothing about the account when the server has answered', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { deviceCache: 'empty' },
    });

    cloud.goOffline();

    expect(matrix()).toBeInTheDocument();
    expect(screen.queryByText(IN_ACCOUNT)).not.toBeInTheDocument();
  });
});

// axe waits on real timers
describe('First visit without a network: accessibility', () => {
  it('has no axe violations', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'offline' },
    });

    expect(screen.getByText(IN_ACCOUNT)).toBeVisible();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
