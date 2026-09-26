import { screen, within } from '@testing-library/react';

/**
 * The account button of a signed-out user, in the header. After Sign out the
 * line above the empty matrix has a "Sign in" button too.
 */
export const getAccountSignIn = () =>
  within(screen.getByRole('banner')).getByRole('button', { name: 'Sign in' });
