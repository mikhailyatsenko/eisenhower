import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const banner = () => screen.getByRole('banner');

describe('Header', () => {
  it('is the banner, with a link to the matrix named after the app', async () => {
    await renderHomePage();

    const home = within(banner()).getByRole('link', {
      name: 'Eisenhower Matrix',
    });

    expect(home).toHaveAttribute('href', '/');
    // The page's own h1 stays in the content, the name in the header isn't one
    expect(banner()).not.toContainElement(
      screen.getByRole('heading', { level: 1 }),
    );
  });

  it('holds the view tabs, the theme button and the account', async () => {
    await renderHomePage();

    expect(
      within(banner()).getByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument();
    expect(
      within(banner()).getByRole('tablist', { name: 'View' }),
    ).toBeInTheDocument();
    expect(
      within(banner()).getByRole('button', { name: 'Sign in' }),
    ).toBeInTheDocument();
  });

  it('names the theme button after the theme it switches to', async () => {
    const { user } = await renderHomePage();

    await user.click(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    );

    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('dark');

    await user.click(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    );

    expect(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    ).toBeInTheDocument();
  });

  it('puts the sync bar in the DOM right after itself', async () => {
    const { cloud } = await renderHomePage({ signedIn: ADA });

    await cloud.goOffline();

    const syncBar = screen.getByRole('status', { name: 'Sync status' });
    expect(syncBar).toHaveTextContent("You're offline.");
    expect(banner().nextElementSibling).toContainElement(syncBar);
  });

  it('has no axe violations', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
