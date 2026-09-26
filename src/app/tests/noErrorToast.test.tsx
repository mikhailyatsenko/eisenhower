import { screen, within } from '@testing-library/react';
import { Task } from '@/shared/stores/tasksStore';
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a refused Delete all in the sync bar, not in a toast', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: {
        completedTasks: [
          completed('done-1', 'Filed taxes'),
          completed('done-2', 'Booked flights'),
        ],
      },
    });
    cloud.rejectNextWrite('permission-denied');

    const toggle = screen.getByRole('button', { name: /Completed Tasks/ });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /delete all/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Some changes couldn't be saved to your account.",
    );
    // The refused delete is rolled back: Completed comes back with both
    const block = (
      await screen.findByRole('button', { name: 'Completed Tasks (2)' })
    ).parentElement!;
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

    await user.click(screen.getByRole('option'));
    await user.click(
      within(screen.getByRole('toolbar')).getByRole('button', { name: 'Edit' }),
    );
    // A half-typed date: the field's value is empty, the browser knows better
    const date = screen.getByLabelText<HTMLInputElement>('Date');
    Object.defineProperty(date, 'validity', {
      value: { ...date.validity, badInput: true, valid: false },
    });
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(
      'Please select a valid deadline date and time',
    );
    expect(screen.getByLabelText('Date')).toHaveAccessibleDescription(
      'Please select a valid deadline date and time',
    );
    expect(
      screen.getByRole('status', { name: 'Notifications' }),
    ).toBeEmptyDOMElement();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
