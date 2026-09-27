import { screen, within } from '@testing-library/react';
import { formatDate } from '@/shared/lib/formatDate';
import type { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Nothing on the page can make clearing fail: the store action is the real
// one unless a test has it reject. Taken with requireMock in the test: an
// import here would load the store before renderHomePage mocks Firebase.
jest.mock('@/shared/stores/tasksStore', () => {
  const actual = jest.requireActual('@/shared/stores/tasksStore');
  return {
    ...actual,
    clearAllCompletedTasksAction: jest.fn(actual.clearAllCompletedTasksAction),
  };
});

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

// No scenario of Completed asks through the system confirm window
let confirm: jest.SpyInstance;

beforeEach(() => {
  confirm = jest.spyOn(window, 'confirm');
});

afterEach(() => {
  expect(confirm).not.toHaveBeenCalled();
  confirm.mockRestore();
});

const ADA = { uid: 'u1', displayName: 'Ada' };

const TASKS = {
  ImportantUrgent: ['Pay rent'],
  ImportantNotUrgent: ['Plan the quarter'],
  NotImportantNotUrgent: ['Sort old photos'],
};

const completed = (
  id: string,
  text: string,
  completedAt: string,
  quadrantKey: MatrixKey = 'ImportantNotUrgent',
): Task => ({
  id,
  text,
  createdAt: new Date('2026-09-01T10:00:00.000Z'),
  completedAt: new Date(completedAt),
  completed: true,
  quadrantKey,
});

// Seeded oldest first: the section shows the newest first
const DONE = [
  completed('done-1', 'File taxes', '2026-09-21T10:00:00.000Z'),
  completed(
    'done-2',
    'Renew passport',
    '2026-09-22T10:00:00.000Z',
    'ImportantUrgent',
  ),
  completed('done-3', 'Book dentist', '2026-09-23T10:00:00.000Z'),
];

type Page = Awaited<ReturnType<typeof renderHomePage>>;

const openList = async (page: Page) => {
  await page.user.click(screen.getByRole('tab', { name: 'List' }));
  return page;
};

const listPage = (options: Parameters<typeof renderHomePage>[0] = {}) =>
  renderHomePage({ tasks: TASKS, completedTasks: DONE, ...options }).then(
    openList,
  );

const completedToggle = () =>
  screen.getByRole('button', { name: /^Completed, \d+ tasks?$/ });

const expandCompleted = async ({ user }: Page) => {
  await user.click(completedToggle());
};

const completedList = () => screen.getByRole('listbox', { name: 'Completed' });

/** The completed tasks, top to bottom, each starting with its text */
const completedRows = () =>
  within(completedList())
    .getAllByRole('option')
    .map((option) => option.textContent);

const startingWith = (texts: string[]) =>
  texts.map((text) => expect.stringMatching(new RegExp(`^${text}`)));

const row = (text: string) =>
  within(completedList()).getByRole('option', { name: new RegExp(`^${text}`) });

const tasksIn = (title: string) =>
  within(screen.getByRole('listbox', { name: title }))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const toolbar = () => screen.getByRole('toolbar');

const toast = () => screen.getByRole('status', { name: 'Notifications' });

const undoButton = () => screen.getByRole('button', { name: 'Undo' });

/** The header's "Delete all", not the dialog's */
const deleteAllButton = () =>
  within(
    screen.getByRole('button', { name: /^Completed, / }).closest('div')!,
  ).getByRole('button', { name: 'Delete all' });

const deleteAllDialog = (count: number) =>
  screen.getByRole('dialog', { name: `Delete all ${count} completed tasks?` });

describe('Completed section', () => {
  it('is not there without completed tasks', async () => {
    await renderHomePage({ tasks: TASKS }).then(openList);

    expect(
      screen.queryByRole('button', { name: /^Completed/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('listbox', { name: 'Completed' }),
    ).not.toBeInTheDocument();
  });

  it('is the last section, collapsed by default, and remembers being expanded', async () => {
    const page = await listPage();

    const toggle = screen.getByRole('button', { name: 'Completed, 3 tasks' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('listbox', { name: 'Completed' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 2 }).at(-1),
    ).toContainElement(toggle);

    await page.user.click(toggle);
    expect(completedToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(completedToggle()).toHaveAttribute(
      'aria-controls',
      completedList().id,
    );
    expect(screen.getAllByRole('listbox').at(-1)).toBe(completedList());

    await page.reload();

    expect(completedToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(completedList()).toBeInTheDocument();
  });

  it('has no Completed block outside List view', async () => {
    await renderHomePage({ tasks: TASKS, completedTasks: DONE });

    // Only the way into it, "✓ 3 completed →"
    expect(
      screen.queryByRole('button', { name: /^Completed/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('listbox', { name: 'Completed' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('File taxes')).not.toBeInTheDocument();
  });

  it('shows the newest first, and a task just completed at the top', async () => {
    const page = await listPage();
    await expandCompleted(page);

    expect(completedRows()).toEqual(
      startingWith(['Book dentist', 'Renew passport', 'File taxes']),
    );

    await page.user.click(screen.getByRole('option', { name: 'Pay rent' }));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Complete' }),
    );

    expect(completedRows()).toEqual(
      startingWith([
        'Pay rent',
        'Book dentist',
        'Renew passport',
        'File taxes',
      ]),
    );
  });

  it('shows the text, the quadrant in words and the completion date, not the creation date', async () => {
    const page = await listPage();
    await expandCompleted(page);

    const taxes = row('File taxes');
    expect(taxes).toHaveTextContent('Schedule');
    expect(taxes).toHaveTextContent(
      `Completed ${formatDate(DONE[0].completedAt!, { hasTime: true, now: new Date() })}`,
    );
    expect(completedList()).not.toHaveTextContent(/created/i);
    expect(
      within(completedList()).queryByRole('button'),
    ).not.toBeInTheDocument();
  });

  it('labels a task without its quadrant with the one Restore puts it in', async () => {
    const page = await listPage({
      completedTasks: [
        // From before R1: no quadrant remembered
        {
          ...completed('old', 'Old habit', '2026-09-21T10:00:00.000Z'),
          quadrantKey: undefined,
        },
      ],
    });
    await expandCompleted(page);

    expect(row('Old habit')).toHaveTextContent('Eliminate');

    await page.user.click(row('Old habit'));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Restore' }),
    );

    expect(tasksIn('Eliminate')).toEqual(['Old habit', 'Sort old photos']);
    expect(toast()).toHaveTextContent('Restored to Eliminate');
  });

  it('selects a completed task and offers Restore and Delete', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('File taxes'));

    expect(row('File taxes')).toHaveAttribute('aria-selected', 'true');
    const actions = screen.getByRole('toolbar', {
      name: 'Actions for “File taxes”',
    });
    expect(
      within(actions)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual([
      expect.stringContaining('Restore'),
      expect.stringContaining('Delete'),
      expect.stringContaining('×'),
    ]);
  });

  it('restores to the top of its quadrant, and Undo puts it back in place, focused', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('Renew passport'));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Restore' }),
    );

    expect(tasksIn('Do First')).toEqual(['Renew passport', 'Pay rent']);
    expect(toast()).toHaveTextContent('Restored to Do First');
    expect(completedRows()).toEqual(
      startingWith(['Book dentist', 'File taxes']),
    );
    // The next completed task takes the selection; the focus stays on the panel
    expect(row('File taxes')).toHaveAttribute('aria-selected', 'true');
    expect(toolbar()).toContainElement(document.activeElement as HTMLElement);

    await page.user.click(undoButton());

    expect(tasksIn('Do First')).toEqual(['Pay rent']);
    expect(completedRows()).toEqual(
      startingWith(['Book dentist', 'Renew passport', 'File taxes']),
    );
    expect(document.activeElement).toBe(row('Renew passport'));
  });

  it('restores to Schedule with its toast', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Restore' }),
    );

    expect(tasksIn('Schedule')).toEqual(['File taxes', 'Plan the quarter']);
    expect(toast()).toHaveTextContent('Restored to Schedule');
    // The last one: the previous completed task takes the selection
    expect(row('Renew passport')).toHaveAttribute('aria-selected', 'true');
  });

  it('deletes with the Delete key, and Undo brings it back in place', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('Renew passport'));
    await page.user.keyboard('{Delete}');

    expect(completedRows()).toEqual(
      startingWith(['Book dentist', 'File taxes']),
    );
    expect(toast()).toHaveTextContent('Task deleted');
    expect(document.activeElement).toBe(row('File taxes'));

    await page.user.click(undoButton());

    expect(completedRows()).toEqual(
      startingWith(['Book dentist', 'Renew passport', 'File taxes']),
    );
    expect(document.activeElement).toBe(row('Renew passport'));
  });

  it('ignores the keys of the actions it has not', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.keyboard('2c e{Enter}n');

    expect(completedRows()).toEqual(
      startingWith(['Book dentist', 'Renew passport', 'File taxes']),
    );
    expect(tasksIn('Schedule')).toEqual(['Plan the quarter']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(row('File taxes')).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(row('File taxes'));
  });

  it('ignores 1–4 and N on a completed task left focused by Escape', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.keyboard('{Escape}');
    expect(document.activeElement).toBe(row('File taxes'));
    await page.user.keyboard('2n');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(row('File taxes'));
  });

  it('clears the selection with Escape and with ×', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.keyboard('{Escape}');
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(row('File taxes')).toHaveAttribute('aria-selected', 'false');

    await page.user.click(row('File taxes'));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Deselect task' }),
    );
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('continues the arrows from Eliminate into Completed and back', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );
    await page.user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(row('Book dentist'));
    expect(row('Book dentist')).toHaveAttribute('aria-selected', 'true');

    await page.user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );

    // Completed is the last section for ← →
    await page.user.click(
      screen.getByRole('option', { name: 'Plan the quarter' }),
    );
    await page.user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(row('Book dentist'));
    await page.user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(row('Book dentist'));
    await page.user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );
  });

  it('is skipped by the arrows while collapsed', async () => {
    const page = await listPage();

    await page.user.click(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );
    await page.user.keyboard('{ArrowDown}{ArrowRight}');

    expect(document.activeElement).toBe(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );
  });

  it('keeps the focus off <body> when the last completed task is restored', async () => {
    const page = await listPage({
      completedTasks: [DONE[0]],
    });
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Restore' }),
    );

    expect(
      screen.queryByRole('listbox', { name: 'Completed' }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    // The last task of the last open section
    expect(document.activeElement).toBe(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );
  });

  it('keeps the focus on the List view when the last one goes and no task is left', async () => {
    const page = await listPage({ tasks: {}, completedTasks: [DONE[0]] });
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.keyboard('{Delete}');

    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(
      screen.getByRole('group', { name: 'Task matrix' }),
    );
  });

  it('offers Delete all only while expanded', async () => {
    const page = await listPage();

    expect(
      screen.queryByRole('button', { name: 'Delete all' }),
    ).not.toBeInTheDocument();

    await expandCompleted(page);
    expect(screen.getByRole('button', { name: 'Delete all' })).toBeVisible();
  });

  it('asks in a dialog before deleting all, with the focus on Cancel', async () => {
    const page = await listPage();
    await expandCompleted(page);

    await page.user.click(deleteAllButton());

    const dialog = deleteAllDialog(3);
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleDescription("This can't be undone.");
    expect(
      within(dialog).getByRole('button', { name: 'Delete all' }),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    ).toHaveFocus();
  });

  it('names a single completed task', async () => {
    const page = await listPage({ completedTasks: [DONE[0]] });
    await expandCompleted(page);

    await page.user.click(deleteAllButton());

    expect(
      screen.getByRole('dialog', { name: 'Delete 1 completed task?' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['Escape', ({ user }: Page) => user.keyboard('{Escape}')],
    [
      'Cancel',
      ({ user }: Page) =>
        user.click(screen.getByRole('button', { name: 'Cancel' })),
    ],
  ])(
    'keeps them all on %s, with the focus back on Delete all',
    async (_, dismiss) => {
      const page = await listPage();
      await expandCompleted(page);
      await page.user.click(deleteAllButton());

      await dismiss(page);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(completedRows()).toEqual(
        startingWith(['Book dentist', 'Renew passport', 'File taxes']),
      );
      expect(deleteAllButton()).toHaveFocus();
    },
  );

  it('deletes them all on Delete all, and the focus goes to the last task of the open sections', async () => {
    const page = await listPage();
    await expandCompleted(page);
    await page.user.click(deleteAllButton());

    await page.user.click(
      within(deleteAllDialog(3)).getByRole('button', { name: 'Delete all' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Completed/ }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(
      screen.getByRole('option', { name: 'Sort old photos' }),
    );
    // No Undo: the dialog has said so
    expect(toast()).toBeEmptyDOMElement();

    // Gone for good
    await page.reload();
    expect(
      screen.queryByRole('button', { name: /^Completed/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps the focus on the List view when Delete all leaves no task', async () => {
    const page = await listPage({ tasks: {} });
    await expandCompleted(page);
    await page.user.click(deleteAllButton());

    await page.user.click(
      within(deleteAllDialog(3)).getByRole('button', { name: 'Delete all' }),
    );

    expect(document.activeElement).toBe(
      screen.getByRole('group', { name: 'Task matrix' }),
    );
  });

  it('says so inside the dialog when deleting all fails, and lets it try again', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { clearAllCompletedTasksAction } = jest.requireMock<
      typeof import('@/shared/stores/tasksStore')
    >('@/shared/stores/tasksStore');
    jest
      .mocked(clearAllCompletedTasksAction)
      .mockRejectedValueOnce(new Error('Storage is full'));
    const page = await listPage();
    await expandCompleted(page);
    await page.user.click(deleteAllButton());
    const dialog = deleteAllDialog(3);

    await page.user.click(
      within(dialog).getByRole('button', { name: 'Delete all' }),
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "Couldn't delete. Try again",
    );
    expect(dialog).toHaveAttribute('open');
    expect(completedRows()).toHaveLength(3);
    expect(await axe(document.body)).toHaveNoViolations();

    await page.user.click(
      within(dialog).getByRole('button', { name: 'Delete all' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Completed/ }),
    ).not.toBeInTheDocument();
    jest.mocked(console.error).mockRestore();
  });

  it('has no axe violations with the Delete all dialog open', async () => {
    const page = await listPage();
    await expandCompleted(page);
    await page.user.click(deleteAllButton());

    expect(deleteAllDialog(3)).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations with Completed expanded and its panel', async () => {
    const page = await listPage();
    await expandCompleted(page);
    await page.user.click(row('File taxes'));

    expect(toolbar()).toBeInTheDocument();
    expect(await axe(page.container)).toHaveNoViolations();
  });

  it('shows the phone panel on a phone', async () => {
    const page = await listPage({
      viewport: { width: 390, pointer: 'coarse' },
    });
    await expandCompleted(page);
    await page.user.click(row('File taxes'));

    const actions = screen.getByRole('toolbar', {
      name: 'Actions for “File taxes”',
    });
    expect(
      within(actions).getByRole('button', { name: 'Restore' }),
    ).toBeVisible();
    expect(
      within(actions).getByRole('button', { name: 'Delete' }),
    ).toBeVisible();
    expect(
      within(actions).getByRole('button', { name: 'Deselect task' }),
    ).toBeVisible();
    expect(
      within(actions).queryByRole('button', { name: 'Complete' }),
    ).not.toBeInTheDocument();
  });
});

describe('Completed section of a signed-in user without a network', () => {
  it('restores and deletes at once and sends both once back online', async () => {
    const page = await renderHomePage({
      signedIn: ADA,
      cloud: {
        tasks: { ImportantUrgent: ['Pay rent'] },
        completedTasks: [DONE[0], DONE[1]],
        network: 'online',
      },
    }).then(openList);
    page.cloud.goOffline();
    await expandCompleted(page);

    await page.user.click(row('File taxes'));
    await page.user.click(
      within(toolbar()).getByRole('button', { name: 'Restore' }),
    );
    expect(tasksIn('Schedule')).toEqual(['File taxes']);

    // Restore has passed the selection to it
    expect(row('Renew passport')).toHaveAttribute('aria-selected', 'true');
    await page.user.keyboard('{Delete}');
    expect(
      screen.queryByRole('listbox', { name: 'Completed' }),
    ).not.toBeInTheDocument();

    page.cloud.goOnline();

    expect(page.cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Pay rent'],
      ImportantNotUrgent: ['File taxes'],
      completed: [],
    });
  });
});
