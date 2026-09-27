import { screen, within } from '@testing-library/react';
import type { Task } from '@/shared/stores/tasksStore';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = {
  ImportantUrgent: ['Pay rent'],
  NotImportantNotUrgent: ['Sort old photos'],
};

const completedTasks = (count: number): Task[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `done-${index + 1}`,
    text: `Done ${index + 1}`,
    createdAt: new Date('2026-09-01T10:00:00.000Z'),
    // Done 1 is the newest
    completedAt: new Date(Date.UTC(2026, 8, 20, 10, 0) - index * 60_000),
    completed: true,
    quadrantKey: 'ImportantNotUrgent',
  }));

const entry = () => screen.getByRole('button', { name: /^\d+ completed$/ });

const completedToggle = () =>
  screen.getByRole('button', { name: /^Completed, \d+ tasks?$/ });

const completedOptions = () =>
  within(screen.getByRole('listbox', { name: 'Completed' })).getAllByRole(
    'option',
  );

const showMore = () => screen.getByRole('button', { name: 'Show more' });

describe('The way into Completed', () => {
  it('is not under the matrix without completed tasks', async () => {
    await renderHomePage({ tasks: TASKS });

    expect(
      screen.queryByRole('button', { name: /completed/ }),
    ).not.toBeInTheDocument();
  });

  it('shows "✓ N completed →" under the matrix and its hint line', async () => {
    await renderHomePage({ tasks: TASKS, completedTasks: completedTasks(1) });

    expect(entry()).toHaveTextContent('✓ 1 completed →');
    expect(entry()).toHaveAccessibleName('1 completed');
    // After the hint line, below the matrix
    const hint = screen.getByText(/^Click a task to select it/);
    expect(
      hint.compareDocumentPosition(entry()) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const area = screen.getByRole('tabpanel').parentElement!;
    expect(area).toContainElement(entry());
    expect(await axe(area)).toHaveNoViolations();
  });

  it('opens List view on Completed, expanded and focused, without scrolling to the top', async () => {
    const page = await renderHomePage({
      tasks: TASKS,
      completedTasks: completedTasks(3),
    });
    expect(entry()).toHaveTextContent('✓ 3 completed →');
    const scrollTo = jest.spyOn(window, 'scrollTo');
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView');

    await page.user.click(entry());

    expect(screen.getByRole('tab', { name: 'List' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const toggle = screen.getByRole('button', { name: 'Completed, 3 tasks' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();
    // The section's top, its header with it, comes under the top bars
    expect(
      scrollIntoView.mock.contexts.some(
        (element) => element instanceof Element && element.contains(toggle),
      ),
    ).toBe(true);
    // Not in List view
    expect(
      screen.queryByRole('button', { name: /^\d+ completed$/ }),
    ).not.toBeInTheDocument();

    // Remembered, as a click on the header would
    await page.reload();
    await page.user.click(screen.getByRole('tab', { name: 'List' }));
    expect(completedToggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the first 50 completed tasks, 50 more with "Show more", and 50 again after a reload', async () => {
    const page = await renderHomePage({
      tasks: TASKS,
      completedTasks: completedTasks(60),
    });
    await page.user.click(entry());

    expect(completedOptions()).toHaveLength(50);
    expect(completedToggle()).toHaveAccessibleName('Completed, 60 tasks');
    expect(await axe(screen.getByRole('tabpanel'))).toHaveNoViolations();

    await page.user.click(showMore());

    expect(completedOptions()).toHaveLength(60);
    expect(completedOptions()[50]).toHaveTextContent(/^Done 51/);
    expect(completedOptions()[50]).toHaveFocus();
    // Nothing more to show
    expect(
      screen.queryByRole('button', { name: 'Show more' }),
    ).not.toBeInTheDocument();

    await page.reload();
    await page.user.click(screen.getByRole('tab', { name: 'List' }));

    expect(completedOptions()).toHaveLength(50);
  });

  it('shows the first 50 again once Completed is collapsed', async () => {
    const page = await renderHomePage({
      tasks: TASKS,
      completedTasks: completedTasks(60),
    });
    await page.user.click(entry());
    await page.user.click(showMore());
    expect(completedOptions()).toHaveLength(60);

    await page.user.click(completedToggle());
    await page.user.click(completedToggle());

    expect(completedOptions()).toHaveLength(50);
  });

  it('has "Show more" in the keyboard path after the last shown task', async () => {
    const page = await renderHomePage({
      tasks: TASKS,
      completedTasks: completedTasks(51),
    });
    await page.user.click(entry());
    await page.user.click(completedOptions()[49]);
    await page.user.keyboard('{Escape}');

    await page.user.tab();
    expect(showMore()).toHaveFocus();
    await page.user.keyboard('{Enter}');

    expect(completedOptions()).toHaveLength(51);
    expect(completedOptions()[50]).toHaveFocus();
  });
});
