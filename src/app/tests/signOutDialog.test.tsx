import { screen } from '@testing-library/react';
import { getAccountSignIn } from './account';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
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

const signOut = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'Ada' }));
  await user.click(screen.getByRole('button', { name: 'Logout' }));
};

const signOutDialog = () => screen.getByRole('dialog', { name: 'Sign out?' });

/** Offline with two changes waiting for the cloud */
const renderWithTwoUnsavedChanges = async () => {
  const page = await renderHomePage({
    signedIn: ADA,
    cloud: { tasks: SERVER_TASKS },
  });
  page.cloud.goOffline();
  await addTask(page.user, 'Buy milk');
  await addTask(page.user, 'Buy bread');
  return page;
};

const expectSignedIn = () => {
  expect(screen.getByRole('button', { name: 'Ada' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Buy milk' })).toBeVisible();
};

describe('Signing out with unsaved changes', () => {
  it('asks first, in a modal <dialog>, how many changes would be lost', async () => {
    const { user } = await renderWithTwoUnsavedChanges();

    await signOut(user);

    const dialog = signOutDialog();
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveTextContent(
      "2 changes aren't saved to your account yet. If you sign out now, they'll be lost.",
    );
    expect(
      screen.getByRole('button', { name: 'Stay signed in' }),
    ).toHaveFocus();
  });

  it('says "1 change isn\'t" for a single change', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.goOffline();
    await addTask(user, 'Buy milk');

    await signOut(user);

    expect(signOutDialog()).toHaveTextContent(
      "1 change isn't saved to your account yet. If you sign out now, it'll be lost.",
    );
  });

  it('stays signed in on Escape, with the focus back on the account button', async () => {
    const { user, cloud } = await renderWithTwoUnsavedChanges();
    await signOut(user);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectSignedIn();
    expect(screen.getByRole('button', { name: 'Ada' })).toHaveFocus();
    expect(cloud.deviceTasks()).toContain('Buy milk');
  });

  it('stays signed in on "Stay signed in", with the focus back on the account button', async () => {
    const { user, cloud } = await renderWithTwoUnsavedChanges();
    await signOut(user);

    await user.click(screen.getByRole('button', { name: 'Stay signed in' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectSignedIn();
    expect(screen.getByRole('button', { name: 'Ada' })).toHaveFocus();
    expect(cloud.deviceTasks()).toContain('Buy milk');
  });

  it('signs out and clears the device on "Sign out anyway"', async () => {
    const { user, cloud } = await renderWithTwoUnsavedChanges();
    await signOut(user);

    await user.click(screen.getByRole('button', { name: 'Sign out anyway' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getAccountSignIn()).toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    expect(cloud.deviceTasks()).toEqual([]);
  });

  it('signs out at once with nothing waiting for the cloud', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await signOut(user);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getAccountSignIn()).toBeInTheDocument();
    expect(cloud.deviceTasks()).toEqual([]);
  });

  it("doesn't count changes left from an earlier visit", async () => {
    const { user, reload } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, network: 'offline' },
    });
    await addTask(user, 'Buy milk');
    await reload();

    await signOut(user);

    expect(signOutDialog()).toHaveTextContent(
      "Some changes aren't saved to your account yet. If you sign out now, they'll be lost.",
    );
  });

  it('reads the changes out with the dialog', async () => {
    const { user } = await renderWithTwoUnsavedChanges();

    await signOut(user);

    expect(signOutDialog()).toHaveAccessibleDescription(
      "2 changes aren't saved to your account yet. If you sign out now, they'll be lost.",
    );
  });

  it('goes away, keeping the changes, when the session ends meanwhile', async () => {
    const { user, cloud } = await renderWithTwoUnsavedChanges();
    await signOut(user);

    await cloud.expireSession();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign in again' }),
    ).toBeInTheDocument();
    expect(cloud.deviceTasks()).toContain('Buy milk');
  });

  it('has no axe violations', async () => {
    const { user } = await renderWithTwoUnsavedChanges();
    await signOut(user);

    expect(await axe(signOutDialog())).toHaveNoViolations();
  });
});
