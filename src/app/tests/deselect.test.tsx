import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const PHONE = { width: 375, pointer: 'coarse' } as const;

const TASKS = {
  ImportantUrgent: ['Alpha', 'Bravo'],
  ImportantNotUrgent: ['Delta'],
  NotImportantUrgent: ['Echo'],
  NotImportantNotUrgent: ['Golf'],
};

const task = (text: string) => screen.getByRole('option', { name: text });
const toolbar = () => screen.getByRole('toolbar');
const queryToolbar = () => screen.queryByRole('toolbar');
const deselectButton = () =>
  within(toolbar()).getByRole('button', { name: 'Deselect task' });
const fab = () => screen.queryByRole('button', { name: /^new task/i });

describe('Clearing the selection', () => {
  it('clears it on a click on an axis label', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));
    await user.click(screen.getByText('Not Urgent'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'false');
    expect(queryToolbar()).not.toBeInTheDocument();
  });

  it('clears it on a click under the matrix and on the footer', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));
    // The page's own empty space, under the matrix
    await user.click(screen.getByRole('main'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'false');
    expect(queryToolbar()).not.toBeInTheDocument();

    await user.click(task('Bravo'));
    await user.click(screen.getByRole('contentinfo'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'false');
  });

  it('keeps it on a click on the theme toggle', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));
    await user.click(
      screen.getByRole('button', { name: 'Switch to dark theme' }),
    );

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
    expect(toolbar()).toBeInTheDocument();
  });

  it('keeps it on a click on the toast', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Alpha'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByText('Task deleted'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
  });

  it('offers "Deselect task" last in the panel, with Escape as its key', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));

    const buttons = within(toolbar()).getAllByRole('button');
    expect(buttons.at(-1)).toBe(deselectButton());
    expect(deselectButton()).toHaveAttribute('aria-keyshortcuts', 'Escape');
  });

  it('leaves the task focused and not selected after "Deselect task"', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));
    await user.click(deselectButton());

    expect(queryToolbar()).not.toBeInTheDocument();
    expect(task('Bravo')).toHaveFocus();
    expect(task('Bravo')).toHaveAttribute('aria-selected', 'false');
  });

  it('comes back to the task on ArrowDown after "Deselect task" from the keyboard', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));
    deselectButton().focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{ArrowDown}');

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
    expect(task('Bravo')).toHaveFocus();
  });

  it('closes the phone panel on "Deselect task" and brings New task back', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(task('Bravo'));
    expect(fab()).not.toBeInTheDocument();

    await user.click(deselectButton());

    expect(queryToolbar()).not.toBeInTheDocument();
    expect(fab()).toBeInTheDocument();
    expect(task('Bravo')).toHaveAttribute('aria-selected', 'false');
  });

  it('passes axe with the panel open on desktop', async () => {
    const { user, container } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe with the panel open on a phone', async () => {
    const { user, container } = await renderHomePage({
      tasks: TASKS,
      viewport: PHONE,
    });

    await user.click(task('Bravo'));

    expect(await axe(container)).toHaveNoViolations();
  });
});
