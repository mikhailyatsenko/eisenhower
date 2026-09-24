import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const PHONE = { width: 375, pointer: 'coarse' } as const;

const TASKS = {
  ImportantUrgent: ['Alpha', 'Bravo', 'Charlie'],
  ImportantNotUrgent: ['Delta'],
  NotImportantUrgent: ['Echo', 'Foxtrot'],
  NotImportantNotUrgent: ['Golf'],
};

const tasksIn = (title: string) =>
  within(screen.getByRole('listbox', { name: title }))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const task = (text: string) => screen.getByRole('option', { name: text });

describe('Matrix on a phone', () => {
  it('shows the tasks of every quadrant without Expand', async () => {
    await renderHomePage({ tasks: TASKS, viewport: PHONE });

    expect(
      screen.queryByRole('button', { name: /expand|collapse/i }),
    ).not.toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(TASKS.ImportantUrgent);
    expect(tasksIn('Schedule')).toEqual(TASKS.ImportantNotUrgent);
    expect(tasksIn('Delegate')).toEqual(TASKS.NotImportantUrgent);
    expect(tasksIn('Eliminate')).toEqual(TASKS.NotImportantNotUrgent);
    // jsdom has no CSS: the class is how a list was hidden on a phone before
    for (const list of screen.getAllByRole('listbox')) {
      expect(list.closest('.hidden')).toBeNull();
    }
  });

  it('shows the task count next to each quadrant title', async () => {
    await renderHomePage({
      tasks: {
        ImportantUrgent: TASKS.ImportantUrgent,
        ImportantNotUrgent: ['Delta'],
      },
      viewport: PHONE,
    });

    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.getByText('1 task')).toBeInTheDocument();
    expect(screen.getAllByText('0 tasks')).toHaveLength(2);
  });

  it('selects on tap and moves between quadrants with the keys', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(task('Bravo'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('toolbar')).toHaveAccessibleName(
      'Actions for “Bravo”',
    );

    fireEvent.keyDown(task('Bravo'), { key: 'ArrowRight' });

    expect(task('Delta')).toHaveAttribute('aria-selected', 'true');
    expect(task('Delta')).toHaveFocus();
  });

  it('passes axe', async () => {
    const { container, user } = await renderHomePage({
      tasks: TASKS,
      viewport: PHONE,
    });
    await user.click(task('Alpha'));

    expect(await axe(container)).toHaveNoViolations();
  });
});
