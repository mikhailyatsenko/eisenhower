import { render, screen } from '@testing-library/react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { Quadrant, QuadrantProps } from './Quadrant';

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn(() => ({ setNodeRef: jest.fn() })),
}));

describe('Quadrant Component', () => {
  const defaultProps: QuadrantProps = {
    quadrantKey: 'ImportantUrgent' as MatrixKey,
    isDragOver: false,
    expandedQuadrant: null,
    isAnimateByExpandQuadrant: false,
    handleToggleExpand: jest.fn(),
    orderIndex: 1,
    isTypingNewTask: false,
    recentlyAddedQuadrant: null,
    isNoTasks: false,
    children: <div>Task Content</div>,
  };

  it('renders without crashing', () => {
    render(<Quadrant {...defaultProps} />);
    expect(screen.getByText('Do First')).toBeInTheDocument();
    expect(screen.getByText('Task Content')).toBeInTheDocument();
  });

  it('applies dragOver styles when isDragOver is true', () => {
    render(<Quadrant {...defaultProps} isDragOver={true} />);
    const quadrant = screen.getByText('Do First').closest('div');
    expect(quadrant).toHaveClass('!bg-gray-400');
  });

  it('hides buttons when typing a new task', () => {
    render(<Quadrant {...defaultProps} isTypingNewTask={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
