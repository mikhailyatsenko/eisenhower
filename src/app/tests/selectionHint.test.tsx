import { act, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const MOUSE_HINT =
  'Click a task to select it · ↑↓←→ move selection · ? all shortcuts';

const TOUCH_HINT = 'Tap a task to select it';

const TASKS = { ImportantUrgent: ['Alpha'], NotImportantNotUrgent: ['Bravo'] };

const queryHint = (text: string) => screen.queryByText(text);

describe('The line under the matrix', () => {
  it('tells a mouse user how to select, move and see the shortcuts', async () => {
    await renderHomePage({ tasks: TASKS });

    expect(queryHint(MOUSE_HINT)).toBeVisible();
    expect(queryHint(TOUCH_HINT)).not.toBeInTheDocument();
  });

  it('says tap on a touch screen, whatever the width', async () => {
    const { setViewport } = await renderHomePage({
      tasks: TASKS,
      viewport: { pointer: 'coarse' },
    });

    expect(queryHint(TOUCH_HINT)).toBeVisible();
    expect(queryHint(MOUSE_HINT)).not.toBeInTheDocument();

    await setViewport({ width: 375 });

    expect(queryHint(TOUCH_HINT)).toBeVisible();

    await setViewport({ pointer: 'fine' });

    expect(queryHint(MOUSE_HINT)).toBeVisible();
  });

  it('is under an empty matrix too', async () => {
    await renderHomePage();

    expect(queryHint(MOUSE_HINT)).toBeVisible();
  });

  it('is not in List view', async () => {
    const { user } = await renderHomePage({ tasks: TASKS });

    await user.click(screen.getByRole('button', { name: /list view/i }));

    expect(queryHint(MOUSE_HINT)).not.toBeInTheDocument();
    expect(queryHint(TOUCH_HINT)).not.toBeInTheDocument();
  });

  it('leaves Undo the next Tab stop after the matrix', async () => {
    const { user } = await renderHomePage({
      tasks: { NotImportantNotUrgent: ['Alpha', 'Bravo'] },
    });

    await user.click(screen.getByText('Alpha'));
    await user.keyboard('{Delete}');
    const undo = screen.getByRole('button', { name: 'Undo' });

    // Bravo is selected now: from its last action, Tab leaves the matrix
    act(() => {
      within(screen.getByRole('toolbar'))
        .getByRole('button', { name: 'Deselect task' })
        .focus();
    });
    await user.tab();

    expect(undo).toHaveFocus();
  });

  it('passes axe', async () => {
    const { container } = await renderHomePage({ tasks: TASKS });

    expect(await axe(container)).toHaveNoViolations();
  });
});
