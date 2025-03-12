import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// eslint-disable-next-line boundaries/element-types
import { MatrixKey } from '@/entities/Tasks/@x/matrixKey';
import { Quadrant, QuadrantProps } from '../Quadrant';

jest.mock('@dnd-kit/core', () => ({
  useDroppable: jest.fn(() => ({ setNodeRef: jest.fn() })),
}));

jest.mock('../Buttons', () => ({
  Buttons: ({
    handleToggleExpand,
    quadrantKey,
    isExpandedCurrentQuadrant,
  }: {
    handleToggleExpand: (key: MatrixKey) => void;
    quadrantKey: MatrixKey;
    isExpandedCurrentQuadrant: boolean;
  }) => (
    <button onClick={() => handleToggleExpand(quadrantKey)}>
      {isExpandedCurrentQuadrant ? 'Collapse' : 'Expand'}
    </button>
  ),
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

  it('shows expand button when tasks are present', async () => {
    render(<Quadrant {...defaultProps} />);
    const button = screen.getByRole('button', { name: /expand/i });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(defaultProps.handleToggleExpand).toHaveBeenCalledWith(
      'ImportantUrgent',
    );
  });

  it('hides buttons when typing a new task', () => {
    render(<Quadrant {...defaultProps} isTypingNewTask={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
