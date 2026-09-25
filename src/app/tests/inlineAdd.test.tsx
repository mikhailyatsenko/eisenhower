import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const TASKS = {
  ImportantUrgent: ['Alpha', 'Bravo'],
  ImportantNotUrgent: ['Charlie', 'Delta'],
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

const task = (text: string) => screen.getByRole('option', { name: text });

const toast = () => screen.getByRole('status', { name: 'Notifications' });

const selectedTasks = () =>
  screen
    .queryAllByRole('option', { selected: true })
    .map((option) => option.textContent);

describe('Adding a task in the quadrant', () => {
  it('opens the field on a click on empty space of a quadrant with tasks', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));

    expect(field('Schedule')).toHaveFocus();
    expect(field('Schedule')).toHaveValue('');
    // Not a task of the list: it sits after the listbox
    expect(within(list('Schedule')).queryByRole('textbox')).toBeNull();
  });

  it('opens the field in an empty quadrant instead of the add form', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Delegate'));

    expect(field('Delegate')).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds the trimmed text last on Enter and keeps the field open and empty', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('  Echo  {Enter}');

    expect(tasksIn('Schedule')).toEqual(['Charlie', 'Delta', 'Echo']);
    expect(field('Schedule')).toHaveValue('');
    expect(field('Schedule')).toHaveFocus();
    expect(selectedTasks()).toEqual([]);
    expect(toast()).toBeEmptyDOMElement();

    await user.keyboard('Foxtrot{Enter}');

    expect(tasksIn('Schedule')).toEqual([
      'Charlie',
      'Delta',
      'Echo',
      'Foxtrot',
    ]);
    expect(field('Schedule')).toHaveFocus();
  });

  it('ignores Enter on an empty field or one with spaces only', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('{Enter}');
    await user.keyboard('   {Enter}');

    expect(tasksIn('Schedule')).toEqual(['Charlie', 'Delta']);
    expect(field('Schedule')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('takes at most 200 characters', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('x'.repeat(205));

    expect(field('Schedule')).toHaveValue('x'.repeat(200));
  });

  it('closes on Escape without adding, with focus on the quadrant’s +', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('Echo{Escape}');

    expect(queryFields()).toEqual([]);
    expect(tasksIn('Schedule')).toEqual(['Charlie', 'Delta']);
    expect(plus('Schedule')).toHaveFocus();
  });

  it('only clears the selection on the first click with a task selected', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Alpha'));
    await user.click(list('Schedule'));

    expect(selectedTasks()).toEqual([]);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(queryFields()).toEqual([]);

    await user.click(list('Schedule'));

    expect(field('Schedule')).toHaveFocus();
  });

  it('moves the field with its text to another quadrant', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.keyboard('Echo');
    await user.click(list('Delegate'));

    expect(queryFields()).toEqual([field('Delegate')]);
    expect(field('Delegate')).toHaveValue('Echo');
    expect(field('Delegate')).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(tasksIn('Delegate')).toEqual(['Echo']);
    expect(tasksIn('Schedule')).toEqual(['Charlie', 'Delta']);
  });

  it('opens the field from the + in the header, which is out of the Tab order', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    for (const title of ['Do First', 'Schedule', 'Delegate', 'Eliminate']) {
      expect(plus(title)).toHaveAttribute('tabindex', '-1');
    }

    await user.click(plus('Eliminate'));

    expect(field('Eliminate')).toHaveFocus();

    await user.keyboard('Golf{Escape}');

    expect(plus('Eliminate')).toHaveFocus();
  });

  it('clears the selection and keeps the action panel closed while open', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(task('Alpha'));
    await user.click(plus('Schedule'));

    expect(selectedTasks()).toEqual([]);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();

    await user.keyboard('Echo');
    await user.click(task('Bravo'));

    expect(field('Schedule')).toHaveValue('Echo');
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('closes an empty field when focus leaves it, keeps one with text', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.tab();

    expect(queryFields()).toEqual([]);
    expect(document.activeElement).not.toBe(document.body);

    await user.click(list('Schedule'));
    await user.keyboard('Echo');
    await user.tab();

    expect(field('Schedule')).toHaveValue('Echo');
  });

  it('leaves the New task button to the add form with a deadline', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(screen.getByRole('dialog', { name: 'New task' })).toBeVisible();
    expect(queryFields()).toEqual([]);
  });

  it('shows no insert strips between tasks: a click there opens the field', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    // What lies between the cards is the list itself
    const [, second] = within(list('Do First')).getAllByRole('option');
    expect(second.previousElementSibling).toHaveAttribute('role', 'option');

    await user.click(list('Do First'));

    expect(field('Do First')).toHaveFocus();
  });

  it('adds offline for a signed-in user, and the task reaches the server later', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: { ImportantUrgent: ['Pay rent'] } },
    });

    cloud.goOffline();
    await user.click(list('Schedule'));
    await user.type(field('Schedule'), 'Buy milk{Enter}');

    expect(tasksIn('Schedule')).toEqual(['Buy milk']);
    expect(cloud.serverTasks().ImportantNotUrgent).toEqual([]);

    cloud.goOnline();

    expect(cloud.serverTasks().ImportantNotUrgent).toEqual(['Buy milk']);
  });

  it('passes axe with the field open', async () => {
    const { user, container } = await renderHomePage({ tasks: TASKS });

    await user.click(list('Schedule'));
    await user.type(field('Schedule'), 'Echo');

    expect(await axe(container)).toHaveNoViolations();
  });
});
