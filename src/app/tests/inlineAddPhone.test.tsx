import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const PHONE = { width: 375, pointer: 'coarse' } as const;

const TASKS = {
  ImportantUrgent: ['Alpha', 'Bravo'],
  ImportantNotUrgent: ['Charlie'],
};

const list = (title: string) => screen.getByRole('listbox', { name: title });

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const field = (title: string) =>
  screen.getByRole('textbox', { name: `Add task to ${title}` });

const queryFields = () =>
  screen.queryAllByRole('textbox', { name: /^Add task to/ });

const plus = (title: string) =>
  screen.getByRole('button', { name: `Add a task to ${title}` });

const fab = () => screen.queryByRole('button', { name: /^new task/i });

const backButton = () => screen.getByRole('button', { name: 'Back to matrix' });

const listTitles = () =>
  screen
    .getAllByRole('listbox')
    .map((listbox) => listbox.getAttribute('aria-labelledby'))
    .map((id) => document.getElementById(id!)?.textContent);

describe('Adding a task on a phone', () => {
  it('opens the quadrant full screen with the field on a tap on empty space', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    expect(fab()).toBeInTheDocument();

    await user.click(list('Schedule'));

    expect(listTitles()).toEqual(['Schedule']);
    expect(backButton()).toBeInTheDocument();
    expect(field('Schedule')).toHaveFocus();
    expect(fab()).not.toBeInTheDocument();
  });

  it('opens an empty quadrant full screen with the field from its "+"', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(plus('Delegate'));

    expect(listTitles()).toEqual(['Delegate']);
    expect(field('Delegate')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds on Enter and keeps the field open, as on a desktop', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(list('Schedule'));
    await user.keyboard('Delta{Enter}');

    expect(tasksIn('Schedule')).toEqual(['Charlie', 'Delta']);
    expect(field('Schedule')).toHaveValue('');
    expect(field('Schedule')).toHaveFocus();
    expect(listTitles()).toEqual(['Schedule']);
  });

  it('closes the field on Back to matrix, text and all', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(list('Schedule'));
    await user.keyboard('Echo');
    await user.click(backButton());

    expect(listTitles()).toEqual([
      'Do First',
      'Schedule',
      'Delegate',
      'Eliminate',
    ]);
    expect(queryFields()).toEqual([]);
    expect(fab()).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Open Schedule full screen' }),
    ).toHaveFocus();
  });

  it('keeps the quadrant open after Esc, with the focus on its "+"', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(list('Schedule'));
    await user.keyboard('{Escape}');

    expect(queryFields()).toEqual([]);
    expect(listTitles()).toEqual(['Schedule']);
    expect(plus('Schedule')).toHaveFocus();
    expect(fab()).toBeInTheDocument();
  });

  it('closes the field when Undo brings another quadrant full screen', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Complete' }));
    // The first tap only clears the selection that moved on to Bravo
    await user.click(list('Schedule'));
    await user.click(list('Schedule'));
    await user.keyboard('Draft');

    expect(listTitles()).toEqual(['Schedule']);
    expect(field('Schedule')).toHaveValue('Draft');

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(listTitles()).toEqual(['Do First']);
    expect(queryFields()).toEqual([]);
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveFocus();

    // No field left open out of sight: New task comes back with no selection
    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    expect(fab()).toBeInTheDocument();
  });

  it('puts the "+" next to the full-screen button, not inside it', async () => {
    await renderHomePage({ tasks: TASKS, viewport: PHONE });

    const openButton = screen.getByRole('button', {
      name: 'Open Do First full screen',
    });
    expect(openButton).not.toContainElement(plus('Do First'));
  });

  it('passes axe with the field open and in the grid', async () => {
    const { container, user } = await renderHomePage({
      tasks: TASKS,
      viewport: PHONE,
    });

    const inGrid = await axe(container);
    expect(inGrid.violations.map(({ id }) => id)).not.toContain(
      'nested-interactive',
    );
    expect(inGrid).toHaveNoViolations();

    await user.click(list('Schedule'));

    expect(await axe(container)).toHaveNoViolations();
  });
});
