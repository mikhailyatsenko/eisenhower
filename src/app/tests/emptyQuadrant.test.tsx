import { screen } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const DELEGATE_EXAMPLES =
  'e.g. Book the flights, answer routine emails, most meetings';

const EXAMPLES = /^e\.g\. /;

const IN_ACCOUNT =
  "Your tasks are in your account. They'll appear when you're back online.";

/** An empty quadrant's own button, described by the quadrant's title */
const addButton = (name: string, title: string) =>
  screen.getByRole('button', { name, description: title });

const queryAddButtons = (name: string) =>
  screen.queryAllByRole('button', { name });

describe('An empty quadrant', () => {
  it('shows what goes there and that a click adds a task', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Fix the server'] } });

    expect(screen.getByText(DELEGATE_EXAMPLES)).toBeVisible();
    expect(addButton('Click to add a task', 'Delegate')).toBeVisible();
    // Only empty quadrants: Do First has a task
    expect(screen.getAllByText(EXAMPLES)).toHaveLength(3);
    expect(queryAddButtons('Click to add a task')).toHaveLength(3);
  });

  it('says tap on a touch screen', async () => {
    await renderHomePage({ viewport: { pointer: 'coarse' } });

    expect(addButton('Tap to add', 'Delegate')).toBeVisible();
    expect(queryAddButtons('Click to add a task')).toHaveLength(0);
    expect(screen.getByText(DELEGATE_EXAMPLES)).toBeVisible();
  });

  it('says tap in the cell of a phone and in the quadrant full screen', async () => {
    const { user } = await renderHomePage({
      viewport: { pointer: 'coarse', width: 375 },
    });

    expect(addButton('Tap to add', 'Delegate')).toBeVisible();
    expect(screen.getByText(DELEGATE_EXAMPLES)).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Open Delegate full screen' }),
    );

    expect(addButton('Tap to add', 'Delegate')).toBeVisible();
    expect(screen.getByText(DELEGATE_EXAMPLES)).toBeVisible();
  });

  it('opens the add field from its button', async () => {
    const { user } = await renderHomePage();

    await user.click(addButton('Click to add a task', 'Delegate'));

    expect(
      screen.getByRole('textbox', { name: 'Add task to Delegate' }),
    ).toHaveFocus();
  });

  it('has no examples on a cold start of a signed-in user offline', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: {}, deviceCache: 'empty', network: 'offline' },
    });

    expect(screen.getByText(IN_ACCOUNT)).toBeVisible();
    expect(screen.queryAllByText(EXAMPLES)).toHaveLength(0);
    expect(addButton('Click to add a task', 'Delegate')).toBeVisible();
  });

  it('passes axe', async () => {
    const { container } = await renderHomePage({
      tasks: { ImportantUrgent: ['Fix the server'] },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
