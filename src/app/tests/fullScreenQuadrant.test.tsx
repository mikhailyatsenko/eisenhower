import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const PHONE = { width: 375, pointer: 'coarse' } as const;

const TASKS = {
  ImportantUrgent: ['Alpha', 'Bravo', 'Charlie'],
  ImportantNotUrgent: ['Delta'],
  NotImportantUrgent: ['Echo'],
  NotImportantNotUrgent: ['Golf'],
};

const task = (text: string) => screen.getByRole('option', { name: text });
const openButton = (title: string) =>
  screen.getByRole('button', { name: `Open ${title} full screen` });
const backButton = () => screen.getByRole('button', { name: 'Back to matrix' });
const listTitles = () =>
  screen
    .getAllByRole('listbox')
    .map((list) => list.getAttribute('aria-labelledby'))
    .map((id) => document.getElementById(id!)?.textContent);

describe('Full-screen quadrant on a phone', () => {
  it('opens a quadrant from its title and goes back to the matrix', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(openButton('Do First'));

    expect(listTitles()).toEqual(['Do First']);
    const list = screen.getByRole('listbox', { name: 'Do First' });
    expect(
      within(list)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(TASKS.ImportantUrgent);
    expect(screen.getByRole('heading', { name: 'Do First' })).toHaveFocus();

    await user.click(backButton());

    expect(listTitles()).toEqual([
      'Do First',
      'Schedule',
      'Delegate',
      'Eliminate',
    ]);
    expect(openButton('Do First')).toHaveFocus();
  });

  it('keeps selection and the panel inside, and after going back', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(openButton('Do First'));
    await user.click(task('Bravo'));

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('toolbar')).toHaveAccessibleName(
      'Actions for “Bravo”',
    );

    await user.click(backButton());

    expect(task('Bravo')).toHaveAttribute('aria-selected', 'true');
    expect(openButton('Do First')).toHaveFocus();
  });

  it('shows the whole text of the tasks', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    expect(task('Alpha').querySelector('.line-clamp-2')).not.toBeNull();

    await user.click(openButton('Do First'));

    // jsdom has no CSS: the class is what cuts the text to two lines
    expect(task('Alpha').querySelector('.line-clamp-2')).toBeNull();
  });

  it('follows the selection into another quadrant', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(openButton('Do First'));
    await user.click(task('Alpha'));
    fireEvent.keyDown(task('Alpha'), { key: 'ArrowRight' });

    expect(listTitles()).toEqual(['Schedule']);
    expect(task('Delta')).toHaveAttribute('aria-selected', 'true');
    expect(task('Delta')).toHaveFocus();

    await user.click(backButton());

    expect(openButton('Schedule')).toHaveFocus();
  });

  it('opens the quadrant a new task lands in', async () => {
    const { user } = await renderHomePage({ tasks: TASKS, viewport: PHONE });

    await user.click(openButton('Do First'));
    // 2 opens the add form for Schedule
    await user.keyboard('2');
    const dialog = screen.getByRole('dialog', { name: 'New task' });
    await user.type(within(dialog).getByRole('textbox'), 'Hotel');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(listTitles()).toEqual(['Schedule']);
    expect(task('Hotel')).toBeInTheDocument();
  });

  it('shows the whole matrix again on a wider screen', async () => {
    const { user, setViewport } = await renderHomePage({
      tasks: TASKS,
      viewport: PHONE,
    });

    await user.click(openButton('Delegate'));
    setViewport({ width: 1024, pointer: 'fine' });

    expect(listTitles()).toHaveLength(4);
    expect(
      screen.queryByRole('button', { name: /full screen|back to matrix/i }),
    ).not.toBeInTheDocument();
  });

  it('has no full-screen buttons on a desktop', async () => {
    await renderHomePage({ tasks: TASKS });

    expect(
      screen.queryByRole('button', { name: /full screen/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Do First' })).toBeVisible();
  });

  it('passes axe in the grid and full screen', async () => {
    const { container, user } = await renderHomePage({
      tasks: TASKS,
      viewport: PHONE,
    });

    expect(await axe(container)).toHaveNoViolations();

    await user.click(openButton('Schedule'));
    await user.click(task('Delta'));

    expect(await axe(container)).toHaveNoViolations();
  });
});
