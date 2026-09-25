import { act, screen } from '@testing-library/react';
import { axe } from './axe';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const ADA = { uid: 'u1', displayName: 'Ada' };

const SERVER_TASKS = {
  ImportantUrgent: ['Pay rent', 'Call the bank'],
};

const OFFLINE =
  "You're offline. Changes are saved on this device and will sync when you're back online.";

const syncBar = () => screen.getByRole('status', { name: 'Sync status' });

const advance = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

type User = Awaited<ReturnType<typeof renderHomePage>>['user'];

const addTask = async (user: User, text: string) => {
  await user.click(screen.getByRole('button', { name: /new task/i }));
  await user.keyboard(`${text}{Enter}`);
};

/** Every text the bar shows from now on, even for a moment */
const recordBarTexts = () => {
  const texts: string[] = [];
  const observer = new MutationObserver(() => {
    const text = syncBar().textContent ?? '';
    if (text) texts.push(text);
  });
  observer.observe(syncBar(), {
    childList: true,
    subtree: true,
    characterData: true,
  });
  return {
    texts,
    stop: () => observer.disconnect(),
  };
};

describe('Sync bar of a signed-in user', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('says the user is offline as soon as the network goes', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    expect(syncBar()).toBeEmptyDOMElement();

    cloud.goOffline();

    expect(syncBar()).toHaveTextContent(OFFLINE);
  });

  it('says offline when changes wait for the server over 10 s', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });

    cloud.stall();
    await addTask(user, 'Buy milk');
    await advance(9_900);
    expect(syncBar()).toBeEmptyDOMElement();

    await advance(100);
    expect(syncBar()).toHaveTextContent(OFFLINE);
  });

  it('shows the queue going out, then that all is saved, then hides', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, network: 'offline' },
    });
    await addTask(user, 'Buy milk');
    expect(syncBar()).toHaveTextContent(OFFLINE);

    cloud.goOnline();

    expect(syncBar()).toHaveTextContent('Syncing…');
    await advance(0);
    expect(syncBar()).toHaveTextContent('All changes saved');

    await advance(1_900);
    expect(syncBar()).toHaveTextContent('All changes saved');
    await advance(100);
    expect(syncBar()).toBeEmptyDOMElement();
  });

  it('says all is saved once the server answers changes it kept waiting', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.stall();
    await addTask(user, 'Buy milk');
    await advance(10_000);
    expect(syncBar()).toHaveTextContent(OFFLINE);

    cloud.goOnline();
    await advance(0);

    expect(syncBar()).toHaveTextContent('All changes saved');
    await advance(2_000);
    expect(syncBar()).toBeEmptyDOMElement();
  });

  it('hides when the network is back and nothing was changed meanwhile', async () => {
    const { cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    cloud.goOffline();
    expect(syncBar()).toHaveTextContent(OFFLINE);

    cloud.goOnline();
    await advance(0);

    expect(syncBar()).toBeEmptyDOMElement();
  });

  it('shows nothing for a change on a good network, not even for a moment', async () => {
    const { user } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    const { texts, stop } = recordBarTexts();

    await addTask(user, 'Buy milk');
    await advance(15_000);
    stop();

    expect(screen.getByRole('option', { name: 'Buy milk' })).toBeVisible();
    expect(texts).toEqual([]);
    expect(syncBar()).toBeEmptyDOMElement();
  });

  it('shows nothing to a user who is not signed in', async () => {
    const { user, cloud } = await renderHomePage({
      tasks: { ImportantUrgent: ['Pay rent'] },
    });

    cloud.goOffline();
    await addTask(user, 'Buy milk');
    await advance(15_000);

    expect(screen.queryByText(OFFLINE)).not.toBeInTheDocument();
    expect(syncBar()).toBeEmptyDOMElement();
  });

  it('leaves the focus where it was', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS },
    });
    await user.click(screen.getByRole('option', { name: 'Pay rent' }));
    const focused = document.activeElement;

    cloud.goOffline();
    expect(syncBar()).toHaveTextContent(OFFLINE);
    expect(document.activeElement).toBe(focused);

    cloud.goOnline();
    await advance(0);
    expect(syncBar()).toBeEmptyDOMElement();
    expect(document.activeElement).toBe(focused);
  });
});

// axe waits on real timers
describe('Sync bar accessibility', () => {
  it('has no axe violations in any state', async () => {
    const { user, cloud } = await renderHomePage({
      signedIn: ADA,
      cloud: { tasks: SERVER_TASKS, network: 'offline' },
    });
    cloud.goOnline();
    expect(syncBar()).toBeEmptyDOMElement();
    expect(await axe(document.body)).toHaveNoViolations();

    cloud.goOffline();
    await addTask(user, 'Buy milk');
    expect(syncBar()).toHaveTextContent(OFFLINE);
    expect(await axe(document.body)).toHaveNoViolations();

    // "Syncing…" lasts until the next microtask, too short for axe; it is
    // the same region with another text
    cloud.goOnline();
    expect(await screen.findByText('All changes saved')).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
