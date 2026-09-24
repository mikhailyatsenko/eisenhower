import { screen } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

describe('No Analytics', () => {
  it('has no Analytics button', async () => {
    await renderHomePage();

    expect(
      screen.queryByRole('button', { name: /analytics/i }),
    ).not.toBeInTheDocument();
  });

  it('opens no dialog on Alt+S', async () => {
    const { user } = await renderHomePage();

    await user.keyboard('{Alt>}s{/Alt}');

    // The old modal had no dialog role, so check its heading instead
    expect(
      screen.queryByRole('heading', { name: /analytics/i }),
    ).not.toBeInTheDocument();
  });
});
