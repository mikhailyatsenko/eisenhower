import { screen } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

describe('Account button', () => {
  it('shows a signed-out user a "Sign in" button', async () => {
    await renderHomePage();

    const signIn = screen.getByRole('button', { name: 'Sign in' });

    expect(signIn).toHaveTextContent('Sign in');
  });

  it('opens the sign-in menu from the keyboard', async () => {
    const { user } = await renderHomePage();

    screen.getByRole('button', { name: 'Sign in' }).focus();
    await user.keyboard('{Enter}');

    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
  });
});
