import { screen, within } from '@testing-library/react';
import { QUADRANTS } from '@/shared/consts';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const PHONE = { width: 390, pointer: 'coarse' } as const;

const TITLES = Object.values(QUADRANTS).map(({ title }) => title);

const TASKS = {
  ImportantUrgent: ['Pay rent'],
  ImportantNotUrgent: ['Plan the week'],
};

const list = (title: string) => screen.getByRole('listbox', { name: title });

const pill = (title: string) =>
  screen.getByRole('button', { name: `Add a task to ${title}` });

const field = (title: string) =>
  screen.getByRole('textbox', { name: `Add task to ${title}` });

const queryNewTask = () => screen.queryByRole('button', { name: /new task/i });

const queryHints = () => screen.queryAllByText(/click empty space/i);

/** "+ Add": the visible "Add" starts the name, the rest is for screen readers */
const expectPill = (title: string) => {
  const button = pill(title);
  expect(within(button).getByText('Add')).toBeInTheDocument();
  expect(button.textContent).toBe(`Add a task to ${title}`);
  // The matrix stays one Tab stop
  expect(button).toHaveAttribute('tabindex', '-1');
};

describe('"+ Add" in the headers', () => {
  it('is in the header of every quadrant and opens the field there', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    TITLES.forEach(expectPill);

    await user.click(pill('Delegate'));

    expect(field('Delegate')).toHaveFocus();
  });

  it('is in the header of every List view section, a collapsed one too', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });
    await user.click(screen.getByRole('tab', { name: 'List' }));

    TITLES.forEach(expectPill);

    const toggle = screen.getByRole('button', { name: 'Schedule, 1 task' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expectPill('Schedule');

    await user.click(pill('Schedule'));

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(field('Schedule')).toHaveFocus();
  });

  it('is in the grid and in the full-screen header on a phone', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    TITLES.forEach(expectPill);

    await user.click(
      screen.getByRole('button', { name: 'Open Schedule full screen' }),
    );
    expectPill('Schedule');

    await user.click(pill('Schedule'));

    expect(field('Schedule')).toHaveFocus();
    expect(screen.getAllByRole('listbox')).toHaveLength(1);
  });
});

describe('Adding without New task', () => {
  it('has no New task button on a desktop or a phone', async () => {
    const { setViewport } = await renderHomePage();

    expect(queryNewTask()).not.toBeInTheDocument();

    await setViewport(PHONE);

    expect(queryNewTask()).not.toBeInTheDocument();
  });

  it('opens the field on N', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.keyboard('n');

    expect(field('Do First')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the field on a click on empty space and says nothing about it', async () => {
    const { user, reload } = await renderHomePage({ tasks: TASKS });

    expect(queryHints()).toEqual([]);

    await user.click(list('Schedule'));
    expect(field('Schedule')).toHaveFocus();
    await user.keyboard('Book flights{Enter}');

    expect(queryHints()).toEqual([]);

    await reload();
    await user.click(screen.getByRole('tab', { name: 'List' }));

    expect(screen.getByText('Book flights')).toBeInTheDocument();
    expect(queryHints()).toEqual([]);
  });

  it('keeps the examples and "Click to add a task" of an empty quadrant', async () => {
    await renderHomePage({ tasks: TASKS });

    expect(
      screen.getByRole('button', {
        name: 'Click to add a task',
        description: 'Delegate',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^e\.g\. /)).toHaveLength(2);
  });
});

describe('"+ Add" and axe', () => {
  it('has no axe violations in an empty matrix', async () => {
    await renderHomePage();

    TITLES.forEach(expectPill);
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations in List view on a phone', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });
    await user.click(screen.getByRole('tab', { name: 'List' }));

    TITLES.forEach(expectPill);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
