import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = { ImportantUrgent: ['Pay rent'] };

const SIGNED_OUT = /Your tasks are in your Google account/;
const NO_SIGN_UP = /No sign-up — tasks stay in this browser/;

const queryLine = () => screen.queryByText(SIGNED_OUT);

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const signOut = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'Ada' }));
  await user.click(screen.getByRole('button', { name: 'Logout' }));
};

const addTask = async (user: User, text: string) => {
  await user.click(
    screen.getByRole('button', {
      name: 'Click to add a task',
      description: 'Delegate',
    }),
  );
  await user.keyboard(`${text}{Enter}`);
};

describe('The line above the matrix after Sign out', () => {
  it('says where the tasks are and offers Sign in instead of "No sign-up"', async () => {
    const { user } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    expect(queryLine()).not.toBeInTheDocument();

    await signOut(user);

    const line = queryLine();
    expect(line).toBeVisible();
    expect(line).toHaveTextContent(
      'Your tasks are in your Google account. Sign in to see them. Sign in',
    );
    expect(
      within(line!).getByRole('button', { name: 'Sign in' }),
    ).toBeVisible();
    expect(screen.queryByText(NO_SIGN_UP)).not.toBeInTheDocument();
  });

  it('stays after a reload until a task is added', async () => {
    const { user, reload } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await signOut(user);

    await reload();

    expect(queryLine()).toBeVisible();

    await addTask(user, 'Book the flights');

    expect(
      screen.getByRole('option', { name: /Book the flights/ }),
    ).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();

    await reload();

    expect(
      screen.getByRole('option', { name: /Book the flights/ }),
    ).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('does not come back once the added task is completed', async () => {
    const { user } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await signOut(user);
    await addTask(user, 'Book the flights');

    await user.click(screen.getByRole('option', { name: /Book the flights/ }));
    await user.click(screen.getByRole('button', { name: /Complete/ }));

    expect(
      screen.queryByRole('option', { name: /Book the flights/ }),
    ).not.toBeInTheDocument();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('signs in with its button and goes away', async () => {
    const { user } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await signOut(user);

    await user.click(
      within(queryLine()!).getByRole('button', { name: 'Sign in' }),
    );

    expect(
      await screen.findByRole('option', { name: 'Pay rent' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ada' })).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('is not shown when the session expires', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.expireSession();

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('is not shown when the device keeps tasks the user did not add', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['On this device'] },
      signedIn: ADA,
      // An account with tasks of its own: the device's aren't moved there
      cloud: { tasks: { ImportantNotUrgent: ['In the account'] } },
    });
    await user.click(screen.getByRole('button', { name: "Don't add" }));

    await signOut(user);

    expect(
      screen.getByRole('option', { name: /On this device/ }),
    ).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();

    // The account still holds the user's tasks once the device's are done
    await user.click(screen.getByRole('option', { name: /On this device/ }));
    await user.click(screen.getByRole('button', { name: /Complete/ }));

    expect(queryLine()).toBeVisible();
  });

  it('passes axe', async () => {
    const { user, container } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await signOut(user);

    expect(queryLine()).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });
});
