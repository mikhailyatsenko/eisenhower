import { screen, within } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

describe('Task text validation', () => {
  it('waits for Save in the text edit, not for blur', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    await user.click(
      within(screen.getByRole('toolbar')).getByRole('button', {
        name: 'Edit',
      }),
    );
    const field = screen.getByRole('textbox', { name: 'Task text' });
    await user.clear(field);
    // Past the field to Save: leaving it shows nothing
    await user.tab();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(field).not.toHaveAttribute('aria-invalid');

    await user.keyboard('{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent(
      'A task needs some text',
    );
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });
});
