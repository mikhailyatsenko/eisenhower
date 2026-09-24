import { screen, within } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

describe('Footer', () => {
  it('links to the method page next to the Privacy Policy', async () => {
    await renderHomePage();

    const footer = within(screen.getByRole('contentinfo'));

    expect(
      footer.getByRole('link', { name: 'How the Eisenhower Matrix works' }),
    ).toHaveAttribute('href', '/eisenhower-matrix');
    expect(
      footer.getByRole('link', { name: 'Privacy Policy' }),
    ).toBeInTheDocument();
  });
});
