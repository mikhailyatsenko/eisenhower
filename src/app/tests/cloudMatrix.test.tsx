import { act, fireEvent, screen, within } from '@testing-library/react';
import { axe } from './axe';
import { centerOf, dragOver, list, mockQuadrantLayout } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows with axe run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
  NotImportantUrgent: ['Reply to the landlord'],
};

const tasksIn = (title: string) =>
  within(list(title))
    .queryAllByRole('option')
    .map((option) => option.textContent);

const matrix = () => screen.queryByRole('group', { name: 'Task matrix' });

const toast = () => screen.getByRole('status', { name: 'Notifications' });

describe('Cloud Matrix of a signed-in user', () => {
  it('shows the tasks on the server, not the ones on the device', async () => {
    await renderHomePage({
      tasks: { ImportantUrgent: ['Local only'] },
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty' },
    });

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(tasksIn('Delegate')).toEqual(['Reply to the landlord']);
    expect(screen.queryByText('Local only')).not.toBeInTheDocument();
  });

  it('shows a change from another device by itself, without a toast', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.remoteChange((server) => {
      server.add('ImportantNotUrgent', 'Plan the quarter');
      server.rename('Pay rent', 'Pay rent and utilities');
    });

    expect(tasksIn('Schedule')).toEqual(['Plan the quarter']);
    expect(tasksIn('Do First')).toEqual([
      'Pay rent and utilities',
      'Call the bank',
    ]);
    expect(toast()).toBeEmptyDOMElement();
  });

  it('drops the selection when the Selected Task is removed elsewhere', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    expect(screen.getByRole('toolbar')).toBeInTheDocument();

    cloud.remoteChange((server) => server.remove('Pay rent'));

    expect(tasksIn('Do First')).toEqual(['Call the bank']);
    expect(screen.queryAllByRole('option', { selected: true })).toEqual([]);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(document.activeElement).not.toBe(document.body);
    expect(matrix()).toHaveFocus();
    expect(toast()).toBeEmptyDOMElement();
  });

  it('keeps the selection when another task is removed elsewhere', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await user.click(screen.getByRole('option', { name: 'Call the bank' }));

    cloud.remoteChange((server) => server.remove('Pay rent'));

    expect(
      screen.getByRole('option', { name: 'Call the bank' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('toolbar')).toHaveAccessibleName(
      'Actions for “Call the bank”',
    );
  });

  it('opens without a loader and without a network on a device used before', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'warm', network: 'offline' },
    });

    expect(matrix()).toBeInTheDocument();
    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
  });

  // Without a network it shows the Matrix at once: coldStart.test.tsx
  it('waits for the server while the device has nothing cached', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'stalled' },
    });

    expect(matrix()).not.toBeInTheDocument();

    cloud.goOnline();

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
  });

  it('shows the Local matrix while the cloud one is still loading', async () => {
    const { user } = await renderHomePage({
      tasks: { ImportantUrgent: ['Local only'] },
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, deviceCache: 'empty', network: 'stalled' },
    });

    await user.click(screen.getByRole('button', { name: 'Ada' }));
    await user.click(screen.getByText('Local Matrix'));

    expect(tasksIn('Do First')).toEqual(['Local only']);
  });

  it('keeps the Matrix on screen when the subscription fails', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.failSubscription('permission-denied');

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(screen.queryByText(/permission|failed/i)).not.toBeInTheDocument();
  });

  it('writes a change to the server', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    await user.click(
      within(screen.getByRole('toolbar')).getByRole('button', {
        name: 'Complete',
      }),
    );

    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Call the bank'],
      completed: ['Pay rent'],
    });
  });

  it('has no axe violations for a signed-in user', async () => {
    await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('Cloud change during a drag', () => {
  let layoutSpy: jest.SpyInstance;

  beforeEach(() => {
    layoutSpy = mockQuadrantLayout();
  });

  afterEach(() => {
    layoutSpy.mockRestore();
  });

  it('waits for the drop and keeps the drag preview', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await dragOver('Pay rent', 'NotImportantNotUrgent');
    expect(tasksIn('Eliminate')).toEqual(['Pay rent']);

    cloud.remoteChange((server) => server.add('ImportantNotUrgent', 'Plan'));

    expect(tasksIn('Eliminate')).toEqual(['Pay rent']);
    expect(tasksIn('Schedule')).toEqual([]);

    fireEvent.mouseUp(document, centerOf('NotImportantNotUrgent'));
    await act(async () => {});

    expect(tasksIn('Eliminate')).toEqual(['Pay rent']);
    expect(tasksIn('Schedule')).toEqual(['Plan']);
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Call the bank'],
      ImportantNotUrgent: ['Plan'],
      NotImportantNotUrgent: ['Pay rent'],
    });
  });

  it('keeps changes made elsewhere during the drag on the server', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await dragOver('Pay rent', 'NotImportantNotUrgent');
    cloud.remoteChange((server) => {
      server.rename('Call the bank', 'Call the bank today');
      server.remove('Reply to the landlord');
    });

    fireEvent.mouseUp(document, centerOf('NotImportantNotUrgent'));
    await act(async () => {});

    expect(tasksIn('Do First')).toEqual(['Call the bank today']);
    expect(cloud.serverTasks()).toMatchObject({
      ImportantUrgent: ['Call the bank today'],
      NotImportantUrgent: [],
      NotImportantNotUrgent: ['Pay rent'],
    });
  });

  it('shows the change after a drag cancelled with Escape', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    await dragOver('Pay rent', 'NotImportantNotUrgent');
    cloud.remoteChange((server) => server.add('ImportantNotUrgent', 'Plan'));

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await act(async () => {});

    expect(tasksIn('Do First')).toEqual(['Pay rent', 'Call the bank']);
    expect(tasksIn('Schedule')).toEqual(['Plan']);
  });
});
