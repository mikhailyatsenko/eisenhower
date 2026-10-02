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
const moveTo = () => within(toolbar()).getByRole('group', { name: 'Move to' });
const tasksIn = (title: string) =>
  within(screen.getByRole('listbox', { name: title }))
    .queryAllByRole('option')
    .map((option) => option.textContent);

describe('Action panel on a phone', () => {
  it('puts × by the task text, then Complete, Edit, Delete, the deadline and Move to as a 2×2', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(task('Bravo'));

    // Reading order follows the layout: the task's ×, the row, then the mini-matrix
    expect(
      within(toolbar())
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([
      '×',
      'Complete',
      'Edit',
      'Delete',
      'DeadlineNone›',
      'Do First',
      'Schedule',
      'Delegate',
      'Eliminate',
    ]);
    expect(
      within(moveTo()).getByRole('button', { name: 'Do First' }),
    ).toBeDisabled();
    for (const name of ['Schedule', 'Delegate', 'Eliminate']) {
      expect(within(moveTo()).getByRole('button', { name })).toBeEnabled();
    }
  });

  it('moves the task from the mini-matrix', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(task('Bravo'));
    await user.click(
      within(moveTo()).getByRole('button', { name: 'Eliminate' }),
    );

    expect(tasksIn('Eliminate')).toEqual(['Golf', 'Bravo']);
    expect(await screen.findByText('Moved to Eliminate')).toBeInTheDocument();
  });

  it('keeps the one-row toolbar on desktop', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Bravo'));

    expect(
      within(toolbar())
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-keyshortcuts')),
    ).toEqual(['C', 'E', '1', '2', '3', '4', 'D', 'Delete', 'Escape']);
  });

  it('passes axe with the panel open', async () => {
    const { container, user } = await renderHomePage({
      tasks: TASKS,
      viewport: PHONE,
    });
    await user.click(task('Bravo'));

    expect(await axe(container)).toHaveNoViolations();
  });
});
