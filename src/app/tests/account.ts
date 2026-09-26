import { screen, within } from '@testing-library/react';

const banner = () => screen.getByRole('banner');

/**
 * The account button of a signed-out user, in the header. After Sign out the
 * line above the empty matrix has a "Sign in" button too.
 */
export const getAccountSignIn = () =>
  within(banner()).getByRole('button', { name: 'Sign in' });

/** The signed-in account's avatar button in the header, named by the account */
export const getAccountButton = (name = 'Ada') =>
  within(banner()).getByRole('button', { name });
