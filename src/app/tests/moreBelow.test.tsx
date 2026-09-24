import { act, fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { mockListLayout } from './listLayout';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

// Each list shows 100px: two 40px cards whole, the third only in part
const LAYOUT = { listHeight: 100, rowHeight: 40 };

const SIX = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];

const doFirst = () => screen.getByRole('listbox', { name: 'Do First' });

const moreBelow = () =>
  screen.queryByRole('button', { name: /more tasks? below$/ });

const scrollDoFirst = (top: number) =>
  act(() => {
    doFirst().scrollTop = top;
  });

let restoreLayout: () => void;

beforeEach(() => {
  restoreLayout = mockListLayout(LAYOUT);
});

afterEach(() => restoreLayout());

describe('"+N below" on an overflowing quadrant', () => {
  it('counts the tasks not fully visible below the edge', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: SIX } });

    const indicator = screen.getByRole('button', {
      name: '4 more tasks below',
    });
    expect(indicator).toHaveTextContent('+4 below ↓');
    // The indicator sits outside the listbox: it isn't a task
    expect(within(doFirst()).queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows nothing when every task fits', async () => {
    await renderHomePage({
      tasks: { ImportantUrgent: ['One', 'Two'], ImportantNotUrgent: ['Three'] },
    });

    expect(moreBelow()).not.toBeInTheDocument();
  });

  it('shows one indicator per overflowing quadrant', async () => {
    await renderHomePage({
      tasks: { ImportantUrgent: SIX, NotImportantUrgent: SIX.slice(0, 3) },
    });

    expect(
      screen.getByRole('button', { name: '4 more tasks below' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '1 more task below' }),
    ).toHaveTextContent('+1 below ↓');
  });

  it('recounts on scroll and disappears at the bottom', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: SIX } });

    await scrollDoFirst(40);
    expect(moreBelow()).toHaveAccessibleName('3 more tasks below');

    await scrollDoFirst(140);
    expect(moreBelow()).not.toBeInTheDocument();

    await scrollDoFirst(0);
    expect(moreBelow()).toHaveAccessibleName('4 more tasks below');
  });

  it('scrolls the list down on click', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: SIX },
    });

    await user.click(moreBelow()!);

    // The first task that didn't fit is now at the top
    expect(doFirst().scrollTop).toBe(80);
    expect(moreBelow()).toHaveAccessibleName('2 more tasks below');

    await user.click(moreBelow()!);
    expect(moreBelow()).not.toBeInTheDocument();
  });

  it("doesn't clear the selection when clicked", async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: SIX },
    });

    await user.click(screen.getByRole('option', { name: 'One' }));
    await user.click(moreBelow()!);

    expect(screen.getByRole('option', { name: 'One' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('recounts when the number of tasks changes', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['One', 'Two', 'Three'] },
    });
    expect(moreBelow()).toHaveAccessibleName('1 more task below');

    await user.click(screen.getByRole('option', { name: 'Three' }));
    fireEvent.keyDown(screen.getByRole('option', { name: 'Three' }), {
      key: 'Delete',
    });

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(moreBelow()).not.toBeInTheDocument();
  });

  it('works at phone width too', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: SIX },
      viewport: { width: 375, pointer: 'coarse' },
    });

    // On a phone only the expanded quadrant shows its list
    await user.click(screen.getByRole('button', { name: 'Expand' }));

    expect(moreBelow()).toHaveAccessibleName('4 more tasks below');
  });

  it('keeps focus on the task when a click scrolls to the end', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: SIX },
    });
    const one = screen.getByRole('option', { name: 'One' });

    await user.click(one);
    await user.click(moreBelow()!);
    await user.click(moreBelow()!);

    expect(moreBelow()).not.toBeInTheDocument();
    expect(one).toHaveFocus();
  });

  it('keeps the scrollbar of a quadrant list', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: SIX } });

    // The class is the requirement here: it hid the scrollbar (M2)
    expect(doFirst()).not.toHaveClass('scrollbar-hidden');
  });

  it('passes axe with the indicator shown', async () => {
    const { container } = await renderHomePage({
      tasks: { ImportantUrgent: SIX },
    });

    expect(moreBelow()).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
