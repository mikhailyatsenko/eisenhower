import { screen } from '@testing-library/react';
import { getAccountSignIn } from './account';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  NotImportantUrgent: ['Reply to the landlord'],
};

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const signOut = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'Ada' }));
  await user.click(screen.getByRole('button', { name: 'Logout' }));
};

const signIn = async (user: User) => {
  await user.click(getAccountSignIn());
  await user.click(
    screen.getByRole('button', { name: /continue with google/i }),
  );
};

describe('Signing out on a shared device', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("leaves none of the user's tasks on the device", async () => {
    const { user, cloud, reload } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.goOffline();
    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('Buy milk{Enter}');
    expect(cloud.deviceTasks()).toContain('Buy milk');

    await signOut(user);
    // The unsent change makes Sign out ask first
    await user.click(screen.getByRole('button', { name: 'Sign out anyway' }));

    expect(cloud.deviceTasks()).toEqual([]);
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();

    await reload();

    expect(getAccountSignIn()).toBeInTheDocument();
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();
    expect(cloud.deviceTasks()).toEqual([]);
  });

  it('shows the tasks on the server after signing in again', async () => {
    const { user } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await signOut(user);
    await signIn(user);

    expect(
      await screen.findByRole('option', { name: 'Pay rent' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Reply to the landlord' }),
    ).toBeInTheDocument();
  });

  it('clears the device on the next visit when another tab held it', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { user, cloud, reload } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.holdDeviceInAnotherTab();

    await signOut(user);

    expect(error).toHaveBeenCalled();
    expect(cloud.deviceTasks()).not.toEqual([]);
    expect(screen.queryByText('Pay rent')).not.toBeInTheDocument();

    cloud.closeAnotherTab();
    await reload();

    expect(cloud.deviceTasks()).toEqual([]);
  });

  it('keeps the device cache when the user is gone without signing out', async () => {
    const { cloud, reload } = await renderHomePage({
      cloud: { tasks: SERVER_TASKS, deviceCache: 'warm' },
    });

    await reload();

    expect(cloud.deviceTasks().sort()).toEqual([
      'Call the bank',
      'Pay rent',
      'Reply to the landlord',
    ]);
  });

  it('keeps unsent changes when the session ends after signing in again', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.holdDeviceInAnotherTab();
    await signOut(user);
    cloud.closeAnotherTab();
    await signIn(user);
    await screen.findByRole('option', { name: 'Pay rent' });

    cloud.goOffline();
    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('Buy milk{Enter}');
    await cloud.expireSession();

    expect(cloud.deviceTasks()).toContain('Buy milk');
  });
});
