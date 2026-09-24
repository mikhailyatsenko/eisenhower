import { axe as axeWithAllRules } from 'jest-axe';
import { axe, KNOWN_VIOLATIONS } from './axe';
import { renderHomePage } from './renderHomePage';

const renderSeededHomePage = () =>
  renderHomePage({
    tasks: {
      ImportantUrgent: ['Pay rent'],
      ImportantNotUrgent: ['Plan the quarter'],
      NotImportantUrgent: ['Reply to the landlord'],
    },
  });

describe('Home page accessibility', () => {
  it('has no axe violations beyond the known findings', async () => {
    await renderSeededHomePage();

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('keeps an exception only while its finding is still there', async () => {
    await renderSeededHomePage();

    const { violations } = await axeWithAllRules(document.body);
    const violatedRules = violations.map(({ id }) => id);

    expect(violatedRules.sort()).toEqual(Object.keys(KNOWN_VIOLATIONS).sort());
  });
});
