import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthIndicator, AuthIndicatorProps } from './AuthIndicator';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/shared/stores/tasksStore', () => ({
  ...jest.requireActual('@/shared/stores/tasksStore'),
  useTaskStore: jest.fn().mockReturnValue({ activeState: 'local' }),
  switchToFirebaseTasks: jest.fn(),
  switchToLocalTasks: jest.fn(),
}));

const defaultProps: AuthIndicatorProps = {
  handleGoogleSignIn: jest.fn(),
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg',
  isSignedIn: false,
  handleLogout: jest.fn(),
  localTasks: {
    ImportantUrgent: [],
    ImportantNotUrgent: [],
    NotImportantUrgent: [],
    NotImportantNotUrgent: [],
  },
  cloudTasks: {
    ImportantUrgent: [],
    ImportantNotUrgent: [],
    NotImportantUrgent: [],
    NotImportantNotUrgent: [],
  },
};

describe('AuthIndicator', () => {
  it('bubble button opens and closes', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText(/sign in with Google/i)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('names the avatar button after the signed-in account', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={true} />);

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    expect(screen.getByText(/Logged in as John Doe/i)).toBeInTheDocument();
  });

  it('calls handleGoogleSignIn when sign in button is clicked', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    fireEvent.click(screen.getByText(/sign in with Google/i));
    expect(defaultProps.handleGoogleSignIn).toHaveBeenCalled();
  });

  it('calls handleLogout when logout button is clicked', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={true} />);

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(defaultProps.handleLogout).toHaveBeenCalled();
  });

  it('displays the correct number of tasks in each quadrant', () => {
    const tasks = {
      ImportantUrgent: [],
      ImportantNotUrgent: [
        { id: '2', text: '', createdAt: new Date() },
        { id: '3', text: '', createdAt: new Date() },
      ],
      NotImportantUrgent: [
        { id: '4', text: '', createdAt: new Date() },
        { id: '5', text: '', createdAt: new Date() },
        { id: '6', text: '', createdAt: new Date() },
      ],
      NotImportantNotUrgent: [
        { id: '7', text: '', createdAt: new Date() },
        { id: '8', text: '', createdAt: new Date() },
        { id: '9', text: '', createdAt: new Date() },
        { id: '10', text: '', createdAt: new Date() },
      ],
    };

    render(
      <AuthIndicator
        {...defaultProps}
        isSignedIn={true}
        localTasks={tasks}
        cloudTasks={tasks}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));

    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getAllByText('2')).toHaveLength(2);
    expect(screen.getAllByText('3')).toHaveLength(2);
    expect(screen.getAllByText('4')).toHaveLength(2);
  });

  it('renders user image when photoURL is provided', () => {
    render(
      <AuthIndicator
        {...defaultProps}
        isSignedIn={true}
        photoURL="https://example.com/photo.jpg"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    expect(screen.getByAltText('User profile')).toBeInTheDocument();
  });
});
