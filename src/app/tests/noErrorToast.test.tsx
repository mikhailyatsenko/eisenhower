import { act, screen, within } from '@testing-library/react';
import { Task, useTaskStore } from '@/shared/stores/tasksStore';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const completed = (id: string, text: string): Task => ({
  id,
  text,
  createdAt: new Date('2026-09-20T10:00:00.000Z'),
  completedAt: new Date('2026-09-21T10:00:00.000Z'),
  completed: true,
  quadrantKey: 'ImportantNotUrgent',
});

describe('Delete all completed tasks', () => {
  beforeEach(() => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    // The failure is logged on purpose
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the failure in the Completed block, not in a toast', async () => {
    const { user } = await renderHomePage();
    // Cloud storage without a signed-in user: clearing the cloud fails
    act(() =>
      useTaskStore.setState({
        activeState: 'firebase',
        firebaseCompletedTasks: [
          completed('done-1', 'Filed taxes'),
          completed('done-2', 'Booked flights'),
        ],
      }),
    );

    const toggle = screen.getByRole('button', { name: /Completed Tasks/ });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /delete all/i }));

    const block = toggle.parentElement!;
    expect(within(block).getByRole('alert')).toHaveTextContent(
      "Couldn't delete. Try again",
    );
    expect(within(block).getByText('Filed taxes')).toBeInTheDocument();
    expect(within(block).getByText('Booked flights')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Notifications' }),
    ).toBeEmptyDOMElement();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('Invalid deadline', () => {
  it('explains it in the edit form, not in a toast', async () => {
    const { user } = await renderHomePage({
      tasks: {
        ImportantUrgent: [
          {
            id: 'task-1',
            text: 'Alpha',
            createdAt: new Date('2026-09-20T10:00:00.000Z'),
            dueDate: new Date('2026-09-30T10:00:00.000Z'),
          },
        ],
      },
    });

    await user.click(screen.getByRole('button', { name: 'Edit task' }));
    await user.clear(screen.getByPlaceholderText('Select date'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(
      'Please select a valid deadline date and time',
    );
    expect(
      screen.getByPlaceholderText('Select date'),
    ).toHaveAccessibleDescription(
      'Please select a valid deadline date and time',
    );
    expect(
      screen.getByRole('status', { name: 'Notifications' }),
    ).toBeEmptyDOMElement();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
