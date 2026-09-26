import { screen } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const NO_SIGN_UP = /No sign-up — tasks stay in this browser/;

const queryLine = () => screen.queryByText(NO_SIGN_UP);

describe('The line above an empty matrix', () => {
  it('tells a newcomer there is no sign-up and links to the method', async () => {
    await renderHomePage();

    const line = queryLine();
    expect(line).toBeVisible();
    expect(line).toHaveTextContent(
      'No sign-up — tasks stay in this browser. How it works →',
    );

    const link = screen.getByRole('link', { name: 'How it works →' });
    expect(line).toContainElement(link);
    expect(link).toHaveAttribute('href', '/eisenhower-matrix');
  });

  it('is gone with the first task', async () => {
    const { user } = await renderHomePage();

    await user.click(
      screen.getByRole('button', {
        name: 'Click to add a task',
        description: 'Delegate',
      }),
    );
    await user.keyboard('Book the flights{Enter}');

    expect(
      screen.getByRole('option', { name: /Book the flights/ }),
    ).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('is not above a matrix with tasks, after a reload too', async () => {
    const { reload } = await renderHomePage({
      tasks: { NotImportantNotUrgent: ['Alpha'] },
    });

    expect(queryLine()).not.toBeInTheDocument();

    await reload();

    expect(screen.getByRole('option', { name: /Alpha/ })).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('is never shown to a signed-in user, even with an empty cloud', async () => {
    await renderHomePage({ signedIn: ADA, cloud: { tasks: {} } });

    expect(
      screen.getAllByRole('button', { name: 'Click to add a task' }),
    ).toHaveLength(4);
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('comes after sign-out only if the device has no tasks', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['On this device'] },
      signedIn: ADA,
      // An account with tasks of its own: the device's aren't moved there
      cloud: { tasks: { ImportantNotUrgent: ['In the account'] } },
    });

    await user.click(screen.getByRole('button', { name: 'Ada' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeVisible();
    expect(
      screen.getByRole('option', { name: /On this device/ }),
    ).toBeVisible();
    expect(queryLine()).not.toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = await renderHomePage();

    expect(queryLine()).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });
});
