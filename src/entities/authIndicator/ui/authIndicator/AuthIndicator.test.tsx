import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthIndicator, AuthIndicatorProps } from './AuthIndicator';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const defaultProps: AuthIndicatorProps = {
  handleGoogleSignIn: jest.fn(),
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg',
  isSignedIn: false,
  handleLogout: jest.fn(),
};

describe('AuthIndicator', () => {
  it('bubble button opens and closes', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      screen.getByText(/keep your tasks in your account/),
    ).toHaveTextContent(
      'Saved only on this device. Sign in with Google to keep your tasks in your account and use them on other devices.',
    );

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
    fireEvent.click(
      screen.getByRole('button', { name: /continue with google/i }),
    );
    expect(defaultProps.handleGoogleSignIn).toHaveBeenCalled();
  });

  it('calls handleLogout when logout button is clicked', () => {
    render(<AuthIndicator {...defaultProps} isSignedIn={true} />);

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(defaultProps.handleLogout).toHaveBeenCalled();
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
