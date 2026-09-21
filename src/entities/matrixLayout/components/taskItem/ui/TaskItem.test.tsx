import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Task } from '@/shared/stores/tasksStore';
import { TaskItem } from './TaskItem';

jest.mock('@/shared/config/firebaseConfig', () => ({ db: {}, auth: {} }));

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}));

describe('TaskItem editing', () => {
  // Active tasks don't store their quadrant: it's defined by where they sit in the matrix
  const task: Task = {
    id: '1',
    text: 'Fix production bug',
    createdAt: new Date('2026-09-21T10:00:00.000Z'),
  };

  it('keeps the task in its quadrant when only the text is edited', async () => {
    const user = userEvent.setup();
    const editTaskAction = jest.fn();

    render(
      <TaskItem
        task={task}
        quadrantKey="ImportantUrgent"
        index={0}
        editTaskAction={editTaskAction}
      />,
    );

    await user.click(screen.getByTitle('Edit task'));
    await user.type(screen.getByRole('textbox'), ' ASAP');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(editTaskAction).toHaveBeenCalledWith(
      'ImportantUrgent',
      '1',
      'Fix production bug ASAP',
      null,
      'ImportantUrgent',
    );
  });
});
