import { screen, within } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

const VOCABULARY = [
  { title: 'Do First', criteria: 'Important & urgent' },
  { title: 'Schedule', criteria: 'Important, not urgent' },
  { title: 'Delegate', criteria: 'Not important, urgent' },
  { title: 'Eliminate', criteria: 'Not important, not urgent' },
];

const OLD_NAMES =
  /urgent & important|important & not urgent|urgent & not important|not urgent & not important/i;

describe('Quadrant vocabulary', () => {
  it('names each quadrant heading by its action only', async () => {
    await renderHomePage();

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(VOCABULARY.map(({ title }) => title));
    expect(document.body).not.toHaveTextContent(OLD_NAMES);
  });

  it('names only the quadrant in the toast after restoring a task', async () => {
    const { user } = await renderHomePage({
      completedTasks: [
        {
          id: 'done-1',
          text: 'Book the venue',
          createdAt: new Date('2026-09-20T10:00:00.000Z'),
          completed: true,
          quadrantKey: 'NotImportantUrgent',
        },
      ],
    });

    await user.click(screen.getByRole('tab', { name: 'List' }));
    await user.click(screen.getByRole('button', { name: 'Completed, 1 task' }));
    await user.click(screen.getByRole('option', { name: /^Book the venue/ }));
    await user.click(
      within(screen.getByRole('toolbar')).getByRole('button', {
        name: 'Restore',
      }),
    );

    expect(
      screen.getByRole('status', { name: 'Notifications' }),
    ).toHaveTextContent('Restored to Delegate');
  });
});
