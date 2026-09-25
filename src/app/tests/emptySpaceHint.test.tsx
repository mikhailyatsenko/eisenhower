import { screen } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const HINT = 'click empty space to add';

const TASKS = { ImportantUrgent: ['Alpha'] };

const hints = () => screen.queryAllByText(HINT);

const list = (title: string) => screen.getByRole('listbox', { name: title });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const signOut = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'Ada' }));
  await user.click(screen.getByRole('button', { name: 'Logout' }));
};

describe('The hint "click empty space to add"', () => {
  it('is in the header of every quadrant with a mouse', async () => {
    await renderHomePage({ tasks: TASKS });

    expect(hints()).toHaveLength(4);
    hints().forEach((hint) => expect(hint).toBeVisible());
  });

  it('is not there with a touch screen or narrower than 640px', async () => {
    const { setViewport } = await renderHomePage({
      tasks: TASKS,
      viewport: { pointer: 'coarse' },
    });

    expect(hints()).toHaveLength(0);

    await setViewport({ pointer: 'fine', width: 639 });

    expect(hints()).toHaveLength(0);

    await setViewport({ width: 640 });

    expect(hints()).toHaveLength(4);
  });

  it('goes for good once a task is added by a click on empty space', async () => {
    const { user, reload } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('Echo{Enter}');

    expect(hints()).toHaveLength(0);

    await reload();

    expect(screen.getByText('Echo')).toBeInTheDocument();
    expect(hints()).toHaveLength(0);
  });

  it('stays after a click on empty space that adds nothing', async () => {
    const { user, reload } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('{Escape}');
    await reload();

    expect(hints()).toHaveLength(4);
  });

  it('stays after adding with N, "+" and the empty quadrant\'s button', async () => {
    const { user, reload } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('n');
    await user.keyboard('Bravo{Enter}{Escape}');
    await user.click(
      screen.getByRole('button', { name: 'Add a task to Schedule' }),
    );
    await user.keyboard('Charlie{Enter}{Escape}');
    await user.click(
      screen.getByRole('button', {
        name: 'Click to add a task',
        description: 'Delegate',
      }),
    );
    await user.keyboard('Delta{Enter}');
    await reload();

    expect(screen.getByText('Delta')).toBeInTheDocument();
    expect(hints()).toHaveLength(4);
  });

  it('counts the way the field was last opened', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    // Opened by a click on empty space, then moved by "+"
    await user.click(list('Schedule'));
    await user.click(
      screen.getByRole('button', { name: 'Add a task to Delegate' }),
    );
    await user.keyboard('Echo{Enter}');

    expect(hints()).toHaveLength(4);
  });

  it("doesn't come back after signing in and out", async () => {
    const { user, reload } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: TASKS },
    });

    await user.click(list('Schedule'));
    await user.keyboard('Echo{Enter}');
    await signOut(user);
    await reload();

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(hints()).toHaveLength(0);
  });

  it('passes axe', async () => {
    const { container } = await renderHomePage({ tasks: TASKS });

    expect(await axe(container)).toHaveNoViolations();
  });
});
