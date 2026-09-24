import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const LENGTH_ERROR = 'Task Description must be between 1 and 200 characters.';

const description = () =>
  screen.getByRole('textbox', { name: 'Task Description' });

const expectNoError = () => {
  expect(screen.queryByText(LENGTH_ERROR)).not.toBeInTheDocument();
  expect(description()).not.toHaveAttribute('aria-invalid');
  expect(description()).not.toHaveAccessibleDescription();
};

const expectError = () => {
  expect(screen.getByRole('alert')).toHaveTextContent(LENGTH_ERROR);
  expect(description()).toHaveAttribute('aria-invalid', 'true');
  expect(description()).toHaveAccessibleDescription(LENGTH_ERROR);
};

describe('Task description validation', () => {
  it('shows no error in a freshly opened add form', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(description()).toHaveFocus();
    expectNoError();
  });

  it('shows the error after Save on an empty add form and keeps it open', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expectError();
    expect(
      screen.getByRole('dialog', { name: 'New task' }),
    ).toBeInTheDocument();
  });

  it('shows the error after Enter on an empty add form, without a newline', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('{Enter}');

    expect(description()).toHaveValue('');
    expectError();
  });

  it('shows the error once the empty field loses focus', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.tab();

    expectError();
  });

  it('stays quiet while quadrant and deadline are picked with the mouse', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    const dialog = screen.getByRole('dialog', { name: 'New task' });
    await user.click(within(dialog).getByRole('button', { name: 'Schedule' }));
    await user.click(within(dialog).getByRole('checkbox'));
    await user.click(within(dialog).getByRole('button', { name: '+3h' }));

    expect(description()).toHaveFocus();
    expectNoError();
  });

  it('clears the error as soon as the text becomes valid', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.tab();
    await user.type(description(), 'Call Bob');

    expectNoError();
  });

  it('waits for blur in the edit form too', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Alpha'] },
    });

    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    await user.click(
      within(screen.getByRole('toolbar')).getByRole('button', {
        name: 'Edit',
      }),
    );
    await user.clear(description());

    expectNoError();

    await user.tab();

    expectError();
  });

  it('has no axe violations with the error shown', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // The dialog is portalled to body, outside the render container
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
