import { screen, within } from '@testing-library/react';
import { getAccountSignIn } from './account';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const SERVER_TASKS = { ImportantUrgent: ['Pay rent'] };

const banner = () => screen.getByRole('banner');

describe('Sign in in the header', () => {
  it('shows a signed-out user a "Sign in" button and where the tasks are kept', async () => {
    await renderHomePage();

    expect(getAccountSignIn()).toHaveTextContent('Sign in');
    expect(
      within(banner()).getByText('Saved only on this device'),
    ).toBeInTheDocument();
  });

  it('signs in with Google at once, and the matrix is the account’s', async () => {
    const { user } = await renderHomePage({ cloud: { tasks: SERVER_TASKS } });

    await user.click(getAccountSignIn());

    expect(
      await screen.findByRole('option', { name: 'Pay rent' }),
    ).toBeInTheDocument();
    expect(
      within(banner()).getByRole('button', { name: 'Ada' }),
    ).toBeInTheDocument();
    expect(
      within(banner()).queryByText('Saved only on this device'),
    ).not.toBeInTheDocument();
  });

  it.each(['{Enter}', ' '])(
    'signs in from the keyboard with %s',
    async (key) => {
      const { user } = await renderHomePage({ cloud: { tasks: SERVER_TASKS } });

      getAccountSignIn().focus();
      await user.keyboard(key);

      expect(
        await screen.findByRole('option', { name: 'Pay rent' }),
      ).toBeInTheDocument();
    },
  );

  it('has no axe violations', async () => {
    await renderHomePage();

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
