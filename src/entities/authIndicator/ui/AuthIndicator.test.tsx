import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthIndicator, AuthIndicatorProps } from './AuthIndicator';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  useSearchParams: () => ({
    has: jest.fn().mockReturnValue(false),
  }),
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

    expect(screen.getByTestId('icon-when-closed')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('bubble-corner-button'));
    expect(screen.getByText(/sign in with Google/i)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('icon-when-closed')).toBeInTheDocument();
  });

  it('renders user information when signed in', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={true} />);

    fireEvent.click(screen.getByTestId('bubble-corner-button'));
    expect(screen.getByText(/Logged in as John Doe/i)).toBeInTheDocument();
  });

  it('calls handleGoogleSignIn when sign in button is clicked', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={false} />);

    fireEvent.click(screen.getByTestId('bubble-corner-button'));
    fireEvent.click(screen.getByText(/sign in with Google/i));
    expect(defaultProps.handleGoogleSignIn).toHaveBeenCalled();
  });

  it('calls handleLogout when logout button is clicked', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={true} />);

    fireEvent.click(screen.getByTestId('bubble-corner-button'));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(defaultProps.handleLogout).toHaveBeenCalled();
  });

  // it('switches to cloud matrix when clicked', () => {
  //   const mockPush = jest.fn();
  //   jest.mock('next/navigation', () => ({
  //     useRouter: () => ({ push: mockPush }),
  //     useSearchParams: () => ({ has: jest.fn().mockReturnValue(false) }),
  //   }));

  //   render(<AuthIndicator {...defaultProps} isSignedIn={true} />);

  //   fireEvent.click(screen.getByTestId('bubble-corner-button'));
  //   fireEvent.click(screen.getByText(/Cloud Matrix/i));

  //   expect(mockPush).toHaveBeenCalledTimes(1);
  // });

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

    fireEvent.click(screen.getByTestId('bubble-corner-button'));

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

    fireEvent.click(screen.getByTestId('bubble-corner-button'));
    expect(screen.getByAltText('User profile')).toBeInTheDocument();
  });
});
