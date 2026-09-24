import { act, screen } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

// The old modal had no dialog role, so look for its heading and buttons
const expectNoWelcomeModal = () => {
  expect(
    screen.queryByRole('heading', { name: /welcome/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /get started/i }),
  ).not.toBeInTheDocument();
};

describe('No welcome modal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the matrix on the first visit without a modal', async () => {
    await renderHomePage();

    expectNoWelcomeModal();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expectNoWelcomeModal();
    expect(screen.getByRole('heading', { name: 'Do First' })).toBeVisible();
  });
});
