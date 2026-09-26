import { act, fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = ['Alpha', 'Bravo', 'Charlie'];

const task = (text: string) => screen.getByRole('option', { name: text });

const toolbar = () => screen.getByRole('toolbar');

const tasksIn = (title: string) =>
  within(screen.getByRole('listbox', { name: title }))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const selectedTasks = () =>
  screen
    .queryAllByRole('option', { selected: true })
    .map((option) => option.textContent);

const expectCurrentTask = (text: string) => {
  expect(selectedTasks()).toEqual([text]);
  expect(task(text)).toHaveFocus();
};

/** A native <dialog> opened with showModal(), not a div with a role */
const expectModalDialog = (dialog: HTMLElement) => {
  expect(dialog.tagName).toBe('DIALOG');
  expect(dialog).toHaveAttribute('open');
};

describe('Edit dialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is a modal <dialog> with focus in it', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Edit' }));

    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    expectModalDialog(dialog);
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape and gives the focus back to the task', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.click(within(toolbar()).getByRole('button', { name: 'Edit' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectCurrentTask('Bravo');
  });

  it('gives the focus back to the task after saving', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('e');
    await user.type(screen.getByRole('textbox'), ' ASAP');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectCurrentTask('Bravo ASAP');
  });

  it('follows the task to the quadrant it was moved to', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('e');
    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    await user.click(within(dialog).getByRole('button', { name: /Schedule/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(tasksIn('Schedule')).toEqual(['Bravo']);
    expectCurrentTask('Bravo');
  });

  it('opens the deadline calendar inside the dialog, not behind it', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('e');
    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByLabelText('Deadline date'));

    // Outside a modal <dialog> the page is inert: the calendar can't be used there
    expect(document.querySelector('.react-datepicker')).not.toBeNull();
    expect(dialog).toContainElement(
      document.querySelector<HTMLElement>('.react-datepicker'),
    );
  });

  it('leaves ? and the matrix keys in its text field to the field', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('e');
    await user.type(screen.getByRole('textbox'), ' c?');

    expect(screen.getByRole('textbox')).toHaveValue('Bravo c?');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(tasksIn('Do First')).toEqual(TASKS);
  });

  it('closes on a click outside it', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('e');
    // The backdrop belongs to the <dialog> itself
    await user.click(screen.getByRole('dialog', { name: 'Edit task' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectCurrentTask('Bravo');
  });
});

describe('Add dialog', () => {
  it('is a modal <dialog> and gives the focus back to the New Task button', async () => {
    const { user } = await renderHomePage();

    const newTask = screen.getByRole('button', { name: /new task/i });
    await user.click(newTask);

    expectModalDialog(screen.getByRole('dialog', { name: 'New task' }));
    expect(screen.getByRole('textbox')).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(newTask).toHaveFocus();
  });
});

describe('Shortcuts cheatsheet', () => {
  const cheatsheet = () =>
    screen.getByRole('dialog', { name: 'Keyboard shortcuts' });

  it('opens on ? with nothing selected', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.keyboard('?');

    expectModalDialog(cheatsheet());
  });

  it('explains adding and lists every matrix key, Undo and drag', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.keyboard('?');

    for (const key of [
      '↓',
      '↑',
      '←',
      '→',
      'Tab',
      '1–4',
      'C',
      'Space',
      'E',
      'Enter',
      'Delete',
      'Backspace',
      'N',
      'Esc',
      'Ctrl/Cmd+Z',
      '?',
    ]) {
      expect(
        within(cheatsheet()).getAllByText(key, { selector: 'kbd' }).length,
      ).toBeGreaterThan(0);
    }
    expect(cheatsheet()).toHaveTextContent(
      'Drag a task to reorder or move it; long-press on touch',
    );
    // Adding: empty space, +, N and 1–4 open the field; New task, the form
    expect(cheatsheet()).toHaveTextContent('click empty space in a quadrant');
    expect(cheatsheet()).toHaveTextContent('the + in its title');
    expect(cheatsheet()).toHaveTextContent('press N or 1–4');
    expect(cheatsheet()).toHaveTextContent(
      'Enter adds the task and keeps the field open for the next one',
    );
    expect(cheatsheet()).toHaveTextContent('New task button');
  });

  it('opens with a task selected, holds the matrix keys and gives the focus back', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('?');
    expectModalDialog(cheatsheet());

    await user.keyboard('c');
    expect(tasksIn('Do First')).toEqual(TASKS);

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expectCurrentTask('Bravo');
  });

  it('ends with a link to how the method works, reachable by Tab', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.keyboard('?');
    const link = within(cheatsheet()).getByRole('link', {
      name: 'How the Eisenhower Matrix works →',
    });

    expect(link).toHaveAttribute('href', '/eisenhower-matrix');
    // The next Tab stop after Close, the dialog's only other control
    act(() => {
      within(cheatsheet()).getByRole('button', { name: 'Close' }).focus();
    });
    await user.tab();
    expect(link).toHaveFocus();
    // At the end of the dialog, after the drag hint
    expect(
      screen.getByText(/^Drag a task/).compareDocumentPosition(link) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('opens on the physical ? key of a Cyrillic layout', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: TASKS } });

    // Shift with the ?/ key gives a comma on the Russian layout
    await act(async () => {
      fireEvent.keyDown(document.body, {
        key: ',',
        code: 'Slash',
        shiftKey: true,
      });
    });

    expectModalDialog(cheatsheet());
  });

  it('leaves ? in a form field to the field', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.type(screen.getByRole('textbox'), 'Why?');

    expect(screen.getByRole('textbox')).toHaveValue('Why?');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });
});

// Real timers: axe waits on its own timeouts
describe('Dialogs with axe', () => {
  it('has no axe violations with the edit dialog open', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.click(task('Bravo'));
    await user.keyboard('e');

    // The dialog is portalled to body, outside the render container
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations with the cheatsheet open', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: TASKS },
    });

    await user.keyboard('?');

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
