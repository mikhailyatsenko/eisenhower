import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '@/pages/home';
import {
  MatrixKey,
  STORAGE_KEY,
  Task,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import { getEmptyTasksState } from '@/shared/stores/tasksStore/lib';
import { useUIStore } from '@/shared/stores/uiStore';
import { AppShell } from '../layouts/AppShell';

// These mocks apply to modules loaded after this file: a test imports
// renderHomePage before anything that pulls in Firebase or the router.

// External boundary: no real Firebase. Auth reports "signed out" right away.
jest.mock('@/shared/config/firebaseConfig', () => ({
  db: {},
  auth: {
    onAuthStateChanged: (next: (user: null) => void) => {
      next(null);
      return () => {};
    },
  },
}));

// External boundary: the Next app router isn't mounted outside Next
jest.mock('next/navigation', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  };
  const searchParams = new URLSearchParams();
  return {
    useRouter: () => router,
    useSearchParams: () => searchParams,
    usePathname: () => '/',
  };
});

export interface Viewport {
  /** 'coarse' matches `(hover: none) and (pointer: coarse)`, like a phone */
  pointer: 'fine' | 'coarse';
  /** CSS pixels; below 640 is the phone layout */
  width: number;
}

const DESKTOP: Viewport = { pointer: 'fine', width: 1280 };

let viewport: Viewport = DESKTOP;
type ChangeListener = (event: MediaQueryListEvent) => void;

const mediaQueryLists = new Set<{
  list: MediaQueryList;
  matches: boolean;
  listeners: Set<ChangeListener>;
}>();

const matchesFeature = (feature: string) => {
  const [name, value] = feature
    .replace(/[()]/g, '')
    .split(':')
    .map((part) => part.trim());
  const coarse = viewport.pointer === 'coarse';

  switch (name) {
    case 'hover':
    case 'any-hover':
      return value === (coarse ? 'none' : 'hover');
    case 'pointer':
    case 'any-pointer':
      return value === viewport.pointer;
    case 'max-width':
      return viewport.width <= parseFloat(value);
    case 'min-width':
      return viewport.width >= parseFloat(value);
    // Light theme, motion allowed
    case 'prefers-color-scheme':
      return value === 'light';
    case 'prefers-reduced-motion':
      return value === 'no-preference';
    default:
      throw new Error(`renderHomePage: unsupported media feature ${feature}`);
  }
};

// Supports the subset the app uses: features joined by `and`, lists by `,`
const evaluateQuery = (query: string) =>
  query.split(',').some((part) =>
    part
      .split(/\band\b/)
      .map((feature) => feature.trim())
      .filter((feature) => feature && feature !== 'screen')
      .every(matchesFeature),
  );

const matchMedia = (query: string): MediaQueryList => {
  const listeners = new Set<ChangeListener>();
  const entry = { matches: evaluateQuery(query), listeners } as {
    list: MediaQueryList;
    matches: boolean;
    listeners: Set<ChangeListener>;
  };

  entry.list = {
    media: query,
    get matches() {
      return entry.matches;
    },
    onchange: null,
    addListener: (listener) => listener && listeners.add(listener),
    removeListener: (listener) => listener && listeners.delete(listener),
    addEventListener: (type: string, listener: EventListener) => {
      if (type === 'change') listeners.add(listener as ChangeListener);
    },
    removeEventListener: (type: string, listener: EventListener) => {
      if (type === 'change') listeners.delete(listener as ChangeListener);
    },
    dispatchEvent: () => false,
  } as MediaQueryList;
  mediaQueryLists.add(entry);

  return entry.list;
};

const applyViewport = (next: Viewport) => {
  viewport = next;
  window.innerWidth = next.width;

  mediaQueryLists.forEach((entry) => {
    const { list } = entry;
    const matches = evaluateQuery(list.media);
    if (matches === entry.matches) return;
    entry.matches = matches;
    const event = { matches, media: list.media } as MediaQueryListEvent;
    entry.listeners.forEach((listener) => listener(event));
    list.onchange?.call(list, event);
  });
  window.dispatchEvent(new Event('resize'));
};

type SeedTask = string | Task;

export interface RenderHomePageOptions {
  /** Active tasks per quadrant, stored on the device before mount */
  tasks?: Partial<Record<MatrixKey, SeedTask[]>>;
  completedTasks?: Task[];
  viewport?: Partial<Viewport>;
}

const SEED_DATE = new Date('2026-09-20T10:00:00.000Z');

const toTask = (seed: SeedTask, key: MatrixKey, index: number): Task =>
  typeof seed === 'string'
    ? { id: `${key}-${index}`, text: seed, createdAt: SEED_DATE }
    : seed;

/**
 * Mounts the home page as the user gets it: header controls from the layout,
 * the matrix with a real DndContext and the Matrix stored on the device.
 */
export const renderHomePage = async ({
  tasks = {},
  completedTasks = [],
  viewport: viewportOverrides,
}: RenderHomePageOptions = {}) => {
  // Stores are module singletons: drop what a previous test left behind.
  // Resetting persists the empty state, so it goes before seeding.
  useTaskStore.setState(useTaskStore.getInitialState(), true);
  useUIStore.setState(useUIStore.getInitialState(), true);
  localStorage.clear();
  mediaQueryLists.clear();
  viewport = { ...DESKTOP, ...viewportOverrides };
  window.innerWidth = viewport.width;
  window.matchMedia = matchMedia;
  // jsdom doesn't implement scrolling
  window.scrollTo = () => {};

  const localTasks = getEmptyTasksState();
  (Object.keys(tasks) as MatrixKey[]).forEach((key) => {
    localTasks[key] = tasks[key]!.map((seed, index) =>
      toTask(seed, key, index),
    );
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: { localTasks, localCompletedTasks: completedTasks },
      version: 0,
    }),
  );

  await useTaskStore.persist.rehydrate();
  await useUIStore.persist.rehydrate();

  const user = userEvent.setup();
  const result = render(
    <AppShell serverThemeCookie="light">
      <HomePage />
    </AppShell>,
  );
  // The matrix shows a loader until the (signed-out) sync settles
  await act(async () => {});

  return {
    ...result,
    user,
    /** Switches pointer and width mid-test, firing matchMedia and resize */
    setViewport: (next: Partial<Viewport>) =>
      act(() => applyViewport({ ...viewport, ...next })),
  };
};
