import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const views = () =>
  within(screen.getByRole('banner')).getByRole('tablist', { name: 'View' });
const tab = (name: 'Matrix' | 'List') =>
  within(views()).getByRole('tab', { name });
const viewPanel = () => screen.getByRole('tabpanel');

describe('View segments', () => {
  it('are the tabs "Matrix" and "List" in the header, Matrix selected', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    expect(
      within(views())
        .getAllByRole('tab')
        .map((view) => view.textContent),
    ).toEqual(['Matrix', 'List']);
    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
    expect(tab('List')).toHaveAttribute('aria-selected', 'false');
  });

  it('control the view area, named by the selected tab, with the matrix in it', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    const panel = screen.getByRole('tabpanel', { name: 'Matrix' });
    expect(tab('Matrix')).toHaveAttribute('aria-controls', panel.id);
    expect(tab('List')).toHaveAttribute('aria-controls', panel.id);
    expect(
      within(panel).getByRole('group', { name: 'Task matrix' }),
    ).toBeInTheDocument();
  });

  it('→ selects List and shows List view, ← brings the matrix back', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Pay rent'] },
    });

    tab('Matrix').focus();
    await user.keyboard('{ArrowRight}');

    expect(tab('List')).toHaveAttribute('aria-selected', 'true');
    expect(tab('List')).toHaveFocus();
    expect(viewPanel()).toHaveAccessibleName('List');
    expect(within(viewPanel()).queryByRole('listbox')).not.toBeInTheDocument();
    expect(within(viewPanel()).getByRole('listitem')).toHaveTextContent(
      'Pay rent',
    );

    await user.keyboard('{ArrowLeft}');

    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Matrix')).toHaveFocus();
    expect(viewPanel()).toHaveAccessibleName('Matrix');
    expect(within(viewPanel()).getAllByRole('listbox').length).toBeGreaterThan(
      0,
    );
  });

  it('wrap around with the arrows', async () => {
    const { user } = await renderHomePage();

    tab('Matrix').focus();
    await user.keyboard('{ArrowLeft}');

    expect(tab('List')).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');

    expect(tab('Matrix')).toHaveAttribute('aria-selected', 'true');
  });

  it('switch the view on a click', async () => {
    const { user } = await renderHomePage();

    await user.click(tab('List'));

    expect(tab('List')).toHaveAttribute('aria-selected', 'true');
    expect(viewPanel()).toHaveAccessibleName('List');
  });

  it('put only the selected tab in the Tab order', async () => {
    const { user } = await renderHomePage();

    expect(tab('Matrix')).toHaveAttribute('tabindex', '0');
    expect(tab('List')).toHaveAttribute('tabindex', '-1');

    await user.click(tab('List'));

    expect(tab('Matrix')).toHaveAttribute('tabindex', '-1');
    expect(tab('List')).toHaveAttribute('tabindex', '0');

    // Tab from the selected one leaves the tabs
    tab('List').focus();
    await user.tab();
    expect(tab('Matrix')).not.toHaveFocus();
    expect(views()).not.toContainElement(document.activeElement as HTMLElement);
  });

  it('control an area that is there while the account loads', async () => {
    await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { deviceCache: 'empty', network: 'stalled' },
    });

    expect(
      screen.queryByRole('group', { name: 'Task matrix' }),
    ).not.toBeInTheDocument();
    expect(viewPanel()).toHaveAccessibleName('Matrix');
    expect(tab('Matrix')).toHaveAttribute('aria-controls', viewPanel().id);
  });

  it('has no axe violations', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Pay rent'] } });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
