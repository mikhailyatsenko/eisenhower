import { fireEvent, screen, waitFor } from '@testing-library/react';
import { getAccountButton, getAccountSignIn } from './account';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada', email: 'ada@example.com' };

const SERVER_TASKS = { ImportantUrgent: ['Pay rent'] };

const renderSignedIn = () =>
  renderHomePage({ signedIn: ADA, cloud: { tasks: SERVER_TASKS } });

const menu = () => screen.getByRole('menu', { name: 'Ada' });
const signOutItem = () => screen.getByRole('menuitem', { name: 'Sign out' });

describe('The account menu', () => {
  it('opens from an avatar button named by the account', async () => {
    await renderSignedIn();

    const avatar = getAccountButton();
    expect(avatar).toHaveAttribute('aria-haspopup', 'menu');
    expect(avatar).toHaveAttribute('aria-expanded', 'false');
    // No photo: the first letter of the name
    expect(avatar).toHaveTextContent('A');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it.each(['{Enter}', ' ', '{ArrowDown}'])(
    'opens with %s, focusing "Sign out"',
    async (key) => {
      const { user } = await renderSignedIn();

      getAccountButton().focus();
      await user.keyboard(key);

      expect(getAccountButton()).toHaveAttribute('aria-expanded', 'true');
      expect(signOutItem()).toHaveFocus();
    },
  );

  it('shows the name, the email and where the tasks are kept as text', async () => {
    const { user } = await renderSignedIn();

    getAccountButton().focus();
    await user.keyboard('{Enter}');

    expect(menu()).toHaveAccessibleDescription(
      'Ada ada@example.com Saved to your Google account',
    );
    expect(screen.getByText('ada@example.com')).toBeVisible();
    expect(screen.getByText('Saved to your Google account')).toBeVisible();
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(signOutItem()).toHaveFocus();
  });

  it('keeps the focus in the menu on the arrow keys', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    await user.keyboard('{ArrowDown}');
    expect(signOutItem()).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(signOutItem()).toHaveFocus();
  });

  it('closes on Escape, with the focus back on the avatar', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getAccountButton()).toHaveAttribute('aria-expanded', 'false');
    expect(getAccountButton()).toHaveFocus();
  });

  it('closes on a second click on the avatar', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    await user.click(getAccountButton());

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getAccountButton()).toHaveFocus();
  });

  it("closes on a second click that doesn't focus the avatar, as in Safari", async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    // Safari and Firefox on macOS don't focus a clicked button: the item
    // loses the focus to nothing, then the avatar gets the click
    fireEvent.pointerDown(getAccountButton());
    fireEvent.focusOut(signOutItem(), { relatedTarget: null });
    fireEvent.click(getAccountButton());

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Tab, moving the focus on past the menu', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());
    expect(menu()).toBeVisible();

    await user.keyboard('{Tab}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    expect(getAccountButton()).not.toHaveFocus();
  });

  it('closes on Shift+Tab, with the focus on the avatar', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());
    expect(menu()).toBeVisible();

    await user.keyboard('{Shift>}{Tab}{/Shift}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(getAccountButton()).toHaveFocus();
  });

  it('closes on a click outside', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());
    expect(menu()).toBeVisible();

    await user.click(screen.getByRole('heading', { level: 1 }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on a tap outside that leaves the focus in place, as iOS Safari does', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    fireEvent.pointerDown(screen.getByRole('heading', { level: 1 }));

    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('signs out at once with nothing waiting for the cloud', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    await user.click(signOutItem());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getAccountSignIn()).toBeInTheDocument();
  });

  it('asks first with changes waiting, and "Stay signed in" goes back to the avatar', async () => {
    const { user, cloud } = await renderSignedIn();
    cloud.goOffline();
    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('Buy milk{Enter}');
    await user.click(getAccountButton());

    await user.keyboard('{Enter}');

    expect(
      screen.getByRole('dialog', { name: 'Sign out?' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Stay signed in' }));
    expect(getAccountButton()).toHaveFocus();
  });

  it('takes the focus onto the avatar after "Sign in" in the header', async () => {
    const { user } = await renderHomePage({ cloud: { tasks: SERVER_TASKS } });

    await user.click(getAccountSignIn());

    expect(
      await screen.findByRole('option', { name: 'Pay rent' }),
    ).toBeInTheDocument();
    expect(getAccountButton()).toHaveFocus();
  });

  it("doesn't take the focus on a page opened signed in", async () => {
    await renderSignedIn();

    expect(getAccountButton()).not.toHaveFocus();
  });

  it('has no axe violations with the menu open', async () => {
    const { user } = await renderSignedIn();
    await user.click(getAccountButton());

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
