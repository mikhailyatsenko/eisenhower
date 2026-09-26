import { screen } from '@testing-library/react';

/**
 * The account button of a signed-out user. After Sign out the line above the
 * empty matrix has a "Sign in" button too; the account button comes first.
 */
export const getAccountSignIn = () =>
  screen.getAllByRole('button', { name: 'Sign in' })[0];
