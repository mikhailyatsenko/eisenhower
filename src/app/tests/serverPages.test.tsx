import { within } from '@testing-library/react';
import { renderToString } from 'react-dom/server.node';
import HomePage from '../../../app/page';

// External boundary: no real Firebase on the server render
jest.mock('@/shared/config/firebaseConfig', () => ({ db: {}, auth: {} }));

// External boundary: the Next app router isn't mounted outside Next
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

const renderServerHtml = (page: React.ReactElement) => {
  const container = document.createElement('div');
  // Server HTML only: no effects run, nothing is hydrated
  container.innerHTML = renderToString(page);
  return container;
};

describe('Server pages', () => {
  it('home page has the h1 in its server HTML', () => {
    const page = renderServerHtml(<HomePage />);

    const headings = within(page).getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(
      'Eisenhower Matrix — prioritize tasks by urgency and importance',
    );
  });
});
