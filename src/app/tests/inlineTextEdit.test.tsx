import { act, fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { centerOf, dragOver, list, mockQuadrantLayout } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const PHONE = { width: 390, pointer: 'coarse' } as const;

const TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  ImportantNotUrgent: ['Plan the week'],
};

const card = (text: string) =>
  screen.getByRole('option', { name: new RegExp(`^${text}`) });
const toolbar = () => screen.getByRole('toolbar');
const editPanel = (text: string) =>
  screen.getByRole('group', { name: `Edit text of “${text}”` });
const queryEditPanel = () =>
  screen.queryByRole('group', { name: /^Edit text of/ });
const field = () =>
  screen.getByRole('textbox', { name: 'Task text' }) as HTMLTextAreaElement;
const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

type Page = Awaited<ReturnType<typeof renderHomePage>>;

const select = async ({ user }: Page, text: string) => {
  await user.click(card(text));
};

const openByButton = async (page: Page, text: string) => {
  await select(page, text);
  await page.user.click(
    within(toolbar()).getByRole('button', { name: 'Edit' }),
  );
};

/** Types over the whole text, which the field has selected */
const retype = async ({ user }: Page, text: string) => {
  await user.keyboard(text);
};

const expectNoAxeViolations = async () => {
  expect(await axe(document.body)).toHaveNoViolations();
};

const expectBackOnTask = (text: string) => {
  expect(queryEditPanel()).not.toBeInTheDocument();
  expect(toolbar()).toHaveAccessibleName(`Actions for “${text}”`);
  expect(card(text)).toHaveFocus();
  expect(card(text)).toHaveAttribute('aria-selected', 'true');
};

describe('Editing a task’s text in the action panel', () => {
  it.each([
    ['the Edit button', (page: Page) => openByButton(page, 'Pay rent')],
    [
      'E',
      async (page: Page) => {
        await select(page, 'Pay rent');
        await page.user.keyboard('e');
      },
    ],
    [
      'Enter',
      async (page: Page) => {
        await select(page, 'Pay rent');
        await page.user.keyboard('{Enter}');
      },
    ],
  ])('turns the panel into the text field on %s', async (_, open) => {
    const page = await renderHomePage({ tasks: TASKS });

    await open(page);

    expect(editPanel('Pay rent')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(field()).toHaveValue('Pay rent');
    expect(field()).toHaveFocus();
    expect(field().selectionStart).toBe(0);
    expect(field().selectionEnd).toBe('Pay rent'.length);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // The task stays selected; the panel has no Deadline meanwhile
    expect(card('Pay rent')).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.queryByRole('button', { name: /^Deadline/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the draft on the card, (empty) when there is none', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await retype(page, 'Pay the rent');
    expect(card('Pay the rent')).toHaveAccessibleName('Pay the rent');

    await page.user.clear(field());
    expect(screen.getByRole('option', { selected: true })).toHaveAccessibleName(
      '(empty)',
    );
    await expectNoAxeViolations();
  });

  it('saves on Enter, the focus back on the task', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await retype(page, '  Pay the rent  {Enter}');

    expectBackOnTask('Pay the rent');
    expect(tasksIn('Do First')).toEqual(['Pay the rent', 'Call the bank']);
  });

  it('saves on Save', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await retype(page, 'Pay the rent');
    await page.user.click(
      within(editPanel('Pay rent')).getByRole('button', { name: 'Save' }),
    );

    expectBackOnTask('Pay the rent');
  });

  it('keeps the text on Esc and ← Back', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');
    await retype(page, 'Something else');

    await page.user.keyboard('{Escape}');

    expectBackOnTask('Pay rent');

    await page.user.keyboard('e');
    await retype(page, 'Something else');
    await page.user.click(
      within(editPanel('Pay rent')).getByRole('button', { name: /Back/ }),
    );

    expectBackOnTask('Pay rent');
  });

  it('won’t save an empty text, and the error goes as you type', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await page.user.clear(field());
    await page.user.type(field(), '   {Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'A task needs some text',
    );
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription('A task needs some text');
    expect(field()).toHaveFocus();
    expect(editPanel('Pay rent')).toBeInTheDocument();
    await expectNoAxeViolations();

    await page.user.type(field(), 'x');

    expect(
      screen.queryByText('A task needs some text'),
    ).not.toBeInTheDocument();
    expect(field()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('makes a pasted line break a space, and Shift+Enter adds none', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await page.user.paste('Pay\nthe rent');
    await page.user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(field()).toHaveValue('Pay the rent');

    await page.user.keyboard('{Enter}');

    expect(tasksIn('Do First')).toEqual(['Pay the rent', 'Call the bank']);
  });

  it('counts the characters from 170 and stops at 200', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await page.user.paste('a'.repeat(169));
    expect(screen.queryByText(/\/200$/)).not.toBeInTheDocument();

    await page.user.type(field(), 'a');
    expect(screen.getByText('170/200')).toBeInTheDocument();
    expect(field()).toHaveAccessibleDescription('170/200');
    await expectNoAxeViolations();

    await page.user.paste('b'.repeat(40));
    expect(field().value).toHaveLength(200);
    expect(screen.getByText('200/200')).toBeInTheDocument();
  });

  it('leaves the page keys to the field', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await page.user.keyboard('C2?d');
    expect(field()).toHaveValue('C2?d');
    await page.user.keyboard('{Backspace}{Delete}');

    expect(field()).toHaveValue('C2?');
    expect(tasksIn('Do First')).toEqual(['C2?', 'Call the bank']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(editPanel('Pay rent')).toBeInTheDocument();
  });

  it('leaves Ctrl+Z in the field to the browser, not to Undo', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await select(page, 'Call the bank');
    await page.user.keyboard('c');
    // The neighbour takes the selection
    expect(tasksIn('Do First')).toEqual(['Pay rent']);

    await page.user.keyboard('e');
    await page.user.keyboard('{Control>}z{/Control}');

    expect(tasksIn('Do First')).toEqual(['Pay rent']);
    expect(field()).toHaveFocus();
  });

  it('closes without saving when another task is selected', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');
    await retype(page, 'Something else');

    await select(page, 'Plan the week');

    expect(queryEditPanel()).not.toBeInTheDocument();
    expect(toolbar()).toHaveAccessibleName('Actions for “Plan the week”');
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);

    // Back on the first task: the panel, not the field
    await select(page, 'Pay rent');
    expect(toolbar()).toHaveAccessibleName('Actions for “Pay rent”');
  });

  it('closes without saving on a second click on the task', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');
    await retype(page, 'Something else');

    await page.user.click(card('Something else'));

    expect(queryEditPanel()).not.toBeInTheDocument();
    expect(card('Pay rent')).toHaveAttribute('aria-selected', 'false');
  });

  it('closes when the view switches', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');
    await retype(page, 'Something else');

    await page.user.click(screen.getByRole('tab', { name: 'List' }));

    expect(queryEditPanel()).not.toBeInTheDocument();
    expect(card('Pay rent')).toBeInTheDocument();
  });

  it('works the same in List view', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await page.user.click(screen.getByRole('tab', { name: 'List' }));

    await openByButton(page, 'Plan the week');
    await retype(page, 'Plan the month');
    expect(card('Plan the month')).toHaveAttribute('aria-selected', 'true');
    await expectNoAxeViolations();

    await page.user.keyboard('{Enter}');

    expectBackOnTask('Plan the month');
  });

  it('closes when the task is deleted on another device', async () => {
    const page = await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { tasks: { ImportantUrgent: ['Pay rent', 'Call the bank'] } },
    });
    await openByButton(page, 'Pay rent');

    page.cloud.remoteChange((server) => server.remove('Pay rent'));
    await act(async () => {});

    expect(queryEditPanel()).not.toBeInTheDocument();
    await select(page, 'Call the bank');
    expect(toolbar()).toHaveAccessibleName('Actions for “Call the bank”');
  });

  it('edits the text of a signed-in user without a network', async () => {
    const page = await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { tasks: { ImportantUrgent: ['Pay rent'] } },
    });
    page.cloud.goOffline();

    await openByButton(page, 'Pay rent');
    await retype(page, 'Pay the rent{Enter}');

    expect(card('Pay the rent')).toBeInTheDocument();
    expect(page.cloud.serverTasks().ImportantUrgent).toEqual(['Pay rent']);

    page.cloud.goOnline();

    expect(page.cloud.serverTasks().ImportantUrgent).toEqual(['Pay the rent']);
  });

  it('writes nothing for an unchanged text', async () => {
    const page = await renderHomePage({
      signedIn: { uid: 'u1', displayName: 'Ada' },
      cloud: { tasks: { ImportantUrgent: ['Pay rent'] } },
    });
    // The next write the server gets is refused: it has to be the real edit
    page.cloud.rejectNextWrite();

    await openByButton(page, 'Pay rent');
    await page.user.keyboard('{Enter}');
    expectBackOnTask('Pay rent');

    await page.user.keyboard('e');
    await retype(page, 'Pay the rent{Enter}');
    await act(async () => {});

    expect(page.cloud.serverTasks().ImportantUrgent).toEqual(['Pay rent']);
  });

  it('has no axe violations with the field on desktop', async () => {
    const page = await renderHomePage({ tasks: TASKS });
    await openByButton(page, 'Pay rent');

    await expectNoAxeViolations();
  });

  describe('on a phone', () => {
    it('has Back, "Edit text" and Save over the field', async () => {
      const page = await renderHomePage({ tasks: TASKS, viewport: PHONE });
      await openByButton(page, 'Pay rent');

      const panel = editPanel('Pay rent');
      expect(within(panel).getByText('Edit text')).toBeVisible();
      const buttons = within(panel).getAllByRole('button');
      expect(buttons.map((button) => button.textContent)).toEqual([
        '←\u00a0Back',
        'Save',
      ]);
      // Save comes before the field, over it
      expect(
        buttons[1].compareDocumentPosition(field()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      await expectNoAxeViolations();

      await retype(page, 'Pay the rent');
      await page.user.click(buttons[1]);
      expect(card('Pay the rent')).toBeInTheDocument();
    });

    it('has no axe violations with the error and the counter', async () => {
      const page = await renderHomePage({ tasks: TASKS, viewport: PHONE });
      await openByButton(page, 'Pay rent');

      await page.user.clear(field());
      await page.user.keyboard('{Enter}');
      expect(screen.getByRole('alert')).toBeInTheDocument();
      await expectNoAxeViolations();

      await page.user.paste('a'.repeat(180));
      expect(field()).toHaveAccessibleDescription('180/200');
      await expectNoAxeViolations();
    });
  });
});

describe('Text edit during a drag', () => {
  let layoutSpy: jest.SpyInstance;

  beforeEach(() => {
    layoutSpy = mockQuadrantLayout();
  });

  afterEach(() => {
    layoutSpy.mockRestore();
  });

  it('closes without saving when a drag starts', async () => {
    const page = await renderHomePage({
      tasks: { ImportantUrgent: ['Renew passport'] },
    });
    await openByButton(page, 'Renew passport');
    await retype(page, 'Something else');

    // The card shows the draft until the drag closes the edit
    await dragOver('Something else', 'ImportantNotUrgent');

    expect(queryEditPanel()).not.toBeInTheDocument();

    fireEvent.mouseUp(document, centerOf('ImportantNotUrgent'));
    await act(async () => {});

    expect(card('Renew passport')).toHaveAccessibleName('Renew passport');
  });
});
