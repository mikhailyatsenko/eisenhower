import { within } from '@testing-library/react';
import { renderToString } from 'react-dom/server.node';
import { MATRIX_SHORTCUTS, SITE_URL } from '@/shared/consts';
import { MATRIX_KEYS, QUADRANTS } from '@/shared/consts/quadrants';
import EisenhowerMatrixPage, {
  metadata,
} from '../../../app/eisenhower-matrix/page';
import HomePage from '../../../app/page';
import sitemap from '../../../app/sitemap';
import { axe } from './axe';

// External boundary: no real Firebase on the server render
jest.mock('@/shared/config/firebaseConfig', () => ({ db: {}, auth: {} }));

// External boundary: the Next app router isn't mounted outside Next
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

const renderServerHtml = (page: React.ReactElement) => {
  document.body.innerHTML = '';
  const container = document.body.appendChild(document.createElement('div'));
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

  describe('/eisenhower-matrix', () => {
    it('has its own title and description', () => {
      expect(metadata.title).toMatch(/Eisenhower Matrix/);
      expect(metadata.description).toBeTruthy();
      expect(metadata.alternates?.canonical).toBe('/eisenhower-matrix');
    });

    it('explains the method in five sections', () => {
      const page = renderServerHtml(<EisenhowerMatrixPage />);

      expect(within(page).getAllByRole('heading', { level: 1 })).toHaveLength(
        1,
      );
      const sections = within(page)
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);
      expect(sections).toEqual([
        'What is the Eisenhower Matrix?',
        'The four quadrants',
        'How to use the app',
        'No sign-up needed',
        'FAQ',
      ]);
      expect(page).toHaveTextContent(
        'No sign-up: tasks stay in this browser; sign in with Google to sync',
      );
    });

    it('names every quadrant with its criteria and examples, in matrix order', () => {
      const page = renderServerHtml(<EisenhowerMatrixPage />);

      const quadrantList = within(
        within(page).getByRole('region', { name: 'The four quadrants' }),
      ).getByRole('list');
      const cards = within(quadrantList).getAllByRole('listitem');

      expect(
        cards.map((card) => within(card).getByRole('heading').textContent),
      ).toEqual(MATRIX_KEYS.map((key) => QUADRANTS[key].title));
      MATRIX_KEYS.forEach((key, index) => {
        expect(cards[index]).toHaveTextContent(QUADRANTS[key].criteria);
        expect(cards[index]).toHaveTextContent(QUADRANTS[key].examples);
      });
      expect(cards[0]).toHaveTextContent(
        'e.g. Server is down, tax return due tomorrow',
      );
    });

    it('explains selection, the action panel, the keys and drag', () => {
      const page = renderServerHtml(<EisenhowerMatrixPage />);
      const howTo = within(page).getByRole('region', {
        name: 'How to use the app',
      });

      expect(howTo).toHaveTextContent('Click or tap a task to select it');
      expect(howTo).toHaveTextContent('action panel');
      expect(howTo).toHaveTextContent('Move to');
      expect(howTo).toHaveTextContent(
        'Drag a task to reorder or move it; long-press on touch',
      );
      MATRIX_SHORTCUTS.forEach(({ keys, action }) => {
        keys.forEach((key) =>
          expect(
            within(howTo).getAllByText(key, { selector: 'kbd' }).length,
          ).toBeGreaterThan(0),
        );
        expect(howTo).toHaveTextContent(action);
      });
      // Selection replaced the hover buttons
      expect(howTo).not.toHaveTextContent('Hover over a task');
    });

    it('ends with a link that opens the matrix', () => {
      const page = renderServerHtml(<EisenhowerMatrixPage />);

      expect(
        within(page).getByRole('link', { name: 'Open the matrix' }),
      ).toHaveAttribute('href', '/');
    });

    it('has no axe violations', async () => {
      const page = renderServerHtml(<EisenhowerMatrixPage />);

      expect(await axe(page)).toHaveNoViolations();
    });
  });

  it('sitemap lists the method page', () => {
    expect(sitemap().map(({ url }) => url)).toContain(
      `${SITE_URL}/eisenhower-matrix`,
    );
  });
});
