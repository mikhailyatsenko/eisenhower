import { screen, within } from '@testing-library/react';
import { axe } from './axe';
import { list } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
};

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const expectNoSecondMatrix = () => {
  expect(screen.queryByText('Cloud Matrix')).not.toBeInTheDocument();
  expect(screen.queryByText('Local Matrix')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /Copy all tasks to Cloud/i }),
  ).not.toBeInTheDocument();
};

describe('One Matrix', () => {
  it('offers no second Matrix to a signed-in user with tasks on the device', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Local only'] },
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    expectNoSecondMatrix();
    await user.click(screen.getByRole('button', { name: 'Ada' }));

    expectNoSecondMatrix();
    expect(
      screen.getByText('Saved to your Google account'),
    ).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('offers no second Matrix to an anonymous user', async () => {
    await renderHomePage({ tasks: { ImportantUrgent: ['Local only'] } });

    expectNoSecondMatrix();
  });

  it("shows the account's tasks while signed in and the device's after Sign out", async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Local only'] },
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);

    await user.click(screen.getByRole('button', { name: 'Ada' }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(tasksIn('Do First')).toEqual(['Local only']);
  });

  it('adds a task to the account while signed in, not to the device', async () => {
    const { user, cloud } = await renderHomePage({
      tasks: { ImportantUrgent: ['Local only'] },
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await user.click(screen.getByRole('button', { name: /new task/i }));
    await user.keyboard('Buy milk{Enter}');

    expect(tasksIn('Do First')).toEqual([
      'Pay rent',
      'Call the bank',
      'Buy milk',
    ]);
    expect(cloud.serverTasks().ImportantUrgent).toContain('Buy milk');

    await user.click(screen.getByRole('button', { name: 'Ada' }));
    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(tasksIn('Do First')).toEqual(['Local only']);
  });
});
