import { act, screen, within } from '@testing-library/react';
import { getAccountSignIn } from './account';
import { axe } from './axe';
import { list } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const DEVICE_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  NotImportantUrgent: ['Book the flights'],
};

const MOVED = '3 tasks moved to your account';

const toast = () => screen.getByRole('status', { name: 'Notifications' });

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const advance = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const signIn = async (user: User) => {
  await user.click(getAccountSignIn());
};

const signOut = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'Ada' }));
  await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
};

const expectDeviceTasksShown = () => {
  expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
  expect(tasksIn('Delegate')).toEqual(['Book the flights']);
};

describe('Migration into an empty account', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves the tasks to the account on sign-in, the matrix stays the same', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE_TASKS });

    await signIn(user);

    expectDeviceTasksShown();
    expect(toast()).toHaveTextContent(MOVED);
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Pay rent', 'Call the bank'],
      NotImportantUrgent: ['Book the flights'],
    });
    expect(await axe(document.body)).toHaveNoViolations();

    await signOut(user);

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('keeps the toast past 6 seconds until the matrix changes', async () => {
    jest.useFakeTimers();
    const { user } = await renderHomePage({ tasks: DEVICE_TASKS });

    await signIn(user);
    await advance(10_000);

    expect(toast()).toHaveTextContent(MOVED);

    // Selecting a task changes nothing
    await user.click(screen.getByRole('option', { name: /Pay rent/ }));
    expect(toast()).toHaveTextContent(MOVED);

    await user.click(
      within(screen.getByRole('toolbar')).getByRole('button', {
        name: 'Complete',
      }),
    );

    expect(toast()).not.toHaveTextContent(MOVED);
  });

  it('goes away with the first task added', async () => {
    const { user } = await renderHomePage({ tasks: DEVICE_TASKS });

    await signIn(user);
    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('Buy milk{Enter}');

    expect(toast()).toBeEmptyDOMElement();
  });

  it('counts one task in the singular, a completed one too', async () => {
    const { user, cloud } = await renderHomePage({
      completedTasks: [
        {
          id: 'done-1',
          text: 'Water the plants',
          createdAt: new Date('2026-09-20T10:00:00Z'),
          completed: true,
          completedAt: new Date('2026-09-21T10:00:00Z'),
          quadrantKey: 'ImportantNotUrgent',
        },
      ],
    });

    await signIn(user);

    expect(toast()).toHaveTextContent('1 task moved to your account');
    expect(cloud.serverTasks().completed).toEqual(['Water the plants']);
  });

  it('neither doubles nor asks when the page reloads before the server confirms', async () => {
    const { user, cloud, reload } = await renderHomePage({
      tasks: DEVICE_TASKS,
    });

    cloud.stallNextWrite();
    await signIn(user);

    expectDeviceTasksShown();
    expect(toast()).toHaveTextContent(MOVED);

    await reload();

    expectDeviceTasksShown();
    expect(toast()).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await cloud.goOnline();

    expectDeviceTasksShown();
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Pay rent', 'Call the bank'],
      NotImportantUrgent: ['Book the flights'],
    });

    await signOut(user);

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('keeps the tasks on the device when the cloud refuses them', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE_TASKS });

    cloud.rejectNextWrite();
    await signIn(user);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Some changes couldn't be saved to your account.",
    );
    expect(toast()).not.toHaveTextContent(MOVED);
    expect(cloud.serverTasks().ImportantUrgent).toEqual([]);

    await signOut(user);

    expectDeviceTasksShown();
  });

  it('moves the tasks of a user who was signed in before', async () => {
    const { user, cloud } = await renderHomePage({
      tasks: DEVICE_TASKS,
      signedIn: ADA,
      cloud: { tasks: {} },
    });

    expectDeviceTasksShown();
    expect(toast()).toHaveTextContent(MOVED);
    expect(cloud.serverTasks().NotImportantUrgent).toEqual([
      'Book the flights',
    ]);

    await signOut(user);

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});

describe('Undo Migration', () => {
  const undo = (user: User) =>
    user.click(screen.getByRole('button', { name: 'Undo' }));

  it('puts the account back as before sign-in and stops offering the move', async () => {
    const { user, cloud, reload } = await renderHomePage({
      tasks: DEVICE_TASKS,
    });

    await signIn(user);
    await undo(user);

    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: [],
      NotImportantUrgent: [],
    });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(toast()).toBeEmptyDOMElement();

    await reload();

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(toast()).toBeEmptyDOMElement();
    expect(cloud.serverTasks().ImportantUrgent).toEqual([]);

    await signOut(user);

    expectDeviceTasksShown();

    await signIn(user);

    expectDeviceTasksShown();
    expect(toast()).toHaveTextContent(MOVED);
    expect(cloud.serverTasks().ImportantUrgent).toEqual([
      'Pay rent',
      'Call the bank',
    ]);
  });

  it('undoes the move with Ctrl+Z while the toast is shown', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE_TASKS });

    await signIn(user);
    await user.keyboard('{Control>}z{/Control}');

    expect(cloud.serverTasks().ImportantUrgent).toEqual([]);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(toast()).toBeEmptyDOMElement();

    await signOut(user);

    expectDeviceTasksShown();
  });

  it('undoes offline, and the server gets none of the tasks once back online', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE_TASKS });

    await signIn(user);
    await cloud.goOffline();
    await undo(user);

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(toast()).toBeEmptyDOMElement();

    await cloud.goOnline();

    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: [],
      NotImportantUrgent: [],
    });

    await signOut(user);

    expectDeviceTasksShown();
  });

  it('takes out of the account the tasks a move cut short had left there', async () => {
    const { user, cloud } = await renderHomePage({
      tasks: DEVICE_TASKS,
      cloud: {
        tasks: {
          ImportantUrgent: [
            {
              id: 'ImportantUrgent-0',
              text: 'Pay rent',
              createdAt: new Date('2026-09-20T10:00:00.000Z'),
            },
          ],
        },
      },
    });

    await signIn(user);
    await undo(user);

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(cloud.serverTasks().ImportantUrgent).toEqual([]);

    await signOut(user);

    expectDeviceTasksShown();
  });
});

describe('Migration into an account with its own tasks', () => {
  const DEVICE = {
    ImportantUrgent: ['Pay rent'],
    NotImportantUrgent: ['Book the flights'],
  };
  const ACCOUNT = { cloud: { tasks: { ImportantUrgent: ['Plan the trip'] } } };
  const QUESTION = 'Add 2 tasks from this device to your account?';

  const question = () => screen.getByRole('dialog', { name: QUESTION });

  const expectAccountOnly = () => {
    expect(tasksIn('Do First')).toEqual(['Plan the trip']);
    expect(tasksIn('Delegate')).toEqual([]);
  };

  it('asks once, in a modal <dialog> with the focus on "Add"', async () => {
    const { user } = await renderHomePage({ tasks: DEVICE, ...ACCOUNT });

    await signIn(user);

    const dialog = question();
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription(
      'Your account already has tasks. The tasks from this device will be added after them.',
    );
    expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('"Add" puts the device\'s tasks after the account\'s, with the toast', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE, ...ACCOUNT });

    await signIn(user);
    // The keyboard: no click outside closes the account menu on the way
    await user.keyboard('{Enter}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(['Plan the trip', 'Pay rent']);
    expect(tasksIn('Delegate')).toEqual(['Book the flights']);
    expect(toast()).toHaveTextContent('2 tasks moved to your account');
    expect(screen.getByRole('button', { name: 'Ada' })).toHaveFocus();
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Plan the trip', 'Pay rent'],
      NotImportantUrgent: ['Book the flights'],
    });

    await signOut(user);

    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('Undo after "Add" puts the account back as it was', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE, ...ACCOUNT });

    await signIn(user);
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expectAccountOnly();
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Plan the trip'],
      NotImportantUrgent: [],
    });

    await signOut(user);

    expect(tasksIn('Do First')).toEqual(['Pay rent']);
    expect(tasksIn('Delegate')).toEqual(['Book the flights']);
  });

  it('adds after the account\'s tasks as they are when "Add" is pressed', async () => {
    const { user, cloud } = await renderHomePage({ tasks: DEVICE, ...ACCOUNT });

    await signIn(user);
    await act(async () => {
      cloud.remoteChange((server) => {
        server.add('ImportantUrgent', 'Renew passport');
        server.add('ImportantUrgent', 'Book a dentist');
      });
    });
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(tasksIn('Do First')).toEqual([
      'Plan the trip',
      'Renew passport',
      'Book a dentist',
      'Pay rent',
    ]);
  });

  it('a click on the backdrop answers nothing', async () => {
    const { user } = await renderHomePage({ tasks: DEVICE, ...ACCOUNT });

    await signIn(user);
    await user.click(question());

    expect(question()).toHaveAttribute('open');
  });

  it.each([
    {
      answer: '"Don\'t add"',
      dismiss: (user: User) =>
        user.click(screen.getByRole('button', { name: "Don't add" })),
    },
    { answer: 'Escape', dismiss: (user: User) => user.keyboard('{Escape}') },
  ])(
    '$answer leaves both matrices as they are and stops asking until sign-out',
    async ({ dismiss }) => {
      const { user, cloud, reload } = await renderHomePage({
        tasks: DEVICE,
        ...ACCOUNT,
      });

      await signIn(user);
      await dismiss(user);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expectAccountOnly();
      expect(toast()).toBeEmptyDOMElement();
      expect(screen.getByRole('button', { name: 'Ada' })).toHaveFocus();
      expect(cloud.serverTasks()).toMatchObject({
        ImportantUrgent: ['Plan the trip'],
        NotImportantUrgent: [],
      });

      await reload();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expectAccountOnly();

      await signOut(user);

      expect(tasksIn('Do First')).toEqual(['Pay rent']);
      expect(tasksIn('Delegate')).toEqual(['Book the flights']);

      await signIn(user);

      expect(question()).toBeInTheDocument();
    },
  );

  it('asks a user who was signed in before, with tasks on the device and in the account', async () => {
    await renderHomePage({ tasks: DEVICE, signedIn: ADA, ...ACCOUNT });

    expect(question()).toBeInTheDocument();
    expectAccountOnly();
  });
});
