import { screen } from '@testing-library/react';
import { renderHomePage } from './renderHomePage';

const VOCABULARY = [
  { title: 'Do First', criteria: 'Important & urgent' },
  { title: 'Schedule', criteria: 'Important, not urgent' },
  { title: 'Delegate', criteria: 'Not important, urgent' },
  { title: 'Eliminate', criteria: 'Not important, not urgent' },
];

const OLD_NAMES =
  /urgent & important|important & not urgent|urgent & not important|not urgent & not important/i;

const expectQuadrantPicker = () => {
  VOCABULARY.forEach(({ title, criteria }) => {
    const button = screen.getByRole('button', { name: title });
    expect(button).toHaveAccessibleDescription(criteria);
  });
};

describe('Quadrant vocabulary', () => {
  it('names each quadrant heading by its action only', async () => {
    await renderHomePage();

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(VOCABULARY.map(({ title }) => title));
    expect(document.body).not.toHaveTextContent(OLD_NAMES);
  });

  it('shows name and criteria for each quadrant in the add form', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expectQuadrantPicker();
    expect(document.body).not.toHaveTextContent(OLD_NAMES);
  });

  it('shows name and criteria for each quadrant in the edit form', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantNotUrgent: ['Plan the quarter'] },
    });

    await user.click(screen.getByRole('button', { name: 'Edit task' }));

    expectQuadrantPicker();
  });

  it('names only the quadrant in the toast after adding a task', async () => {
    const { user } = await renderHomePage();

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.click(screen.getByRole('button', { name: 'Delegate' }));
    await user.type(screen.getByRole('textbox'), 'Book the venue');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText('Task successfully added to "Delegate"'),
    ).toBeInTheDocument();
  });
});
