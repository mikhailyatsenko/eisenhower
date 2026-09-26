import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthIndicator, AuthIndicatorProps } from './AuthIndicator';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const defaultProps: AuthIndicatorProps = {
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg',
  handleLogout: jest.fn(),
};

describe('AuthIndicator', () => {
  it('names the avatar button after the signed-in account', () => {
    render(<AuthIndicator {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    expect(screen.getByText(/Logged in as John Doe/i)).toBeInTheDocument();
  });

  it('calls handleLogout when logout button is clicked', () => {
    render(<AuthIndicator {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    fireEvent.click(screen.getByText(/Logout/i));
    expect(defaultProps.handleLogout).toHaveBeenCalled();
  });

  it('renders user image when photoURL is provided', () => {
    render(
      <AuthIndicator
        {...defaultProps}
        photoURL="https://example.com/photo.jpg"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'John Doe' }));
    expect(screen.getByAltText('User profile')).toBeInTheDocument();
  });
});
