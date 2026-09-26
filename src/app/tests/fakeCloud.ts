import { act } from '@testing-library/react';
import type { CloudUser } from '@/shared/api/auth';
import type {
  CloudSnapshot,
  SyncFailure,
  TaskChange,
} from '@/shared/api/cloudMatrix';
import { MATRIX_KEYS } from '@/shared/consts';
import type { MatrixKey, Task, Tasks } from '@/shared/stores/tasksStore';

// A controllable stand-in for the two cloud clients in shared/api. It keeps
// the Firestore semantics the app relies on, and no more: a write shows up
// at once with pending writes, the server confirms it on the next tick when
// online, and offline or stalled it waits in a queue that survives reload.
// A refused write leaves the local view and rejects its promise.

export type Network = 'online' | 'offline' | 'stalled';

interface CloudDoc {
  task: Task;
  quadrantKey: MatrixKey;
  order: number;
  completed: boolean;
}

type Docs = Map<string, CloudDoc>;

interface Listener {
  onNext: (snapshot: CloudSnapshot) => void;
  onError: (failure: SyncFailure) => void;
  /** Hasn't heard from the server since it subscribed or lost the network */
  fromCache: boolean;
}

interface QueuedWrite {
  changes: TaskChange[];
  resolve: () => void;
  reject: (failure: SyncFailure) => void;
  /** The server will refuse it with this code */
  rejectCode?: string;
}

/** What a remote change can do to the server, by task text */
export interface RemoteServer {
  add: (quadrantKey: MatrixKey, text: string) => void;
  remove: (text: string) => void;
  rename: (text: string, newText: string) => void;
  move: (text: string, quadrantKey: MatrixKey) => void;
}

let server: Docs = new Map();
/** What IndexedDB holds: the server as last seen, without the queue */
let cache: Docs = new Map();
let isCacheWarm = false;
/** Another open tab still has the Firestore instance on IndexedDB */
let isDeviceHeld = false;
let queue: QueuedWrite[] = [];
let network: Network = 'online';
let nextRejectCode: string | undefined;
let stallsAtNextWrite = false;
let listeners = new Set<Listener>();
let user: CloudUser | null = null;
let lastUser: CloudUser | null = null;
let userListeners = new Set<(user: CloudUser | null) => void>();
let nextRemoteId = 0;

const copyDocs = (docs: Docs): Docs =>
  new Map(
    [...docs].map(([id, doc]) => [id, { ...doc, task: { ...doc.task } }]),
  );

const applyChanges = (docs: Docs, changes: TaskChange[]) => {
  changes.forEach((change) => {
    if (change.type === 'delete') {
      docs.delete(change.id);
    } else {
      const { task, quadrantKey, order, completed } = change;
      docs.set(task.id, { task: { ...task }, quadrantKey, order, completed });
    }
  });
};

const localDocs = () => {
  const docs = copyDocs(cache);
  queue.forEach(({ changes }) => applyChanges(docs, changes));
  return docs;
};

// Fresh objects every time, like a real snapshot: the store freezes them
const toSnapshot = (docs: Docs, fromCache: boolean): CloudSnapshot => {
  const tasks = Object.fromEntries(
    MATRIX_KEYS.map((key) => [key, [] as Task[]]),
  ) as Tasks;
  const completedTasks: Task[] = [];
  const byOrder = [...docs.values()].sort((a, b) => a.order - b.order);

  byOrder.forEach(({ task, quadrantKey, order, completed }) => {
    if (completed) {
      completedTasks.push({ ...task, order, completed, quadrantKey });
    } else {
      tasks[quadrantKey].push({ ...task, order, completed, quadrantKey });
    }
  });
  completedTasks.sort(
    (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
  );

  return {
    tasks,
    completedTasks,
    fromCache,
    hasPendingWrites: queue.length > 0,
  };
};

const emit = (listener: Listener) =>
  listener.onNext(toSnapshot(localDocs(), listener.fromCache));

const emitAll = () => listeners.forEach(emit);

/**
 * The server answers: the queue goes through, but for the writes it refuses,
 * and the cache catches up
 */
const syncWithServer = () => {
  const answered = queue;
  queue = [];
  answered.forEach(({ changes, rejectCode }) => {
    if (rejectCode === undefined) applyChanges(server, changes);
  });
  cache = copyDocs(server);
  isCacheWarm = true;
  listeners.forEach((listener) => {
    listener.fromCache = false;
  });
  emitAll();
  answered.forEach(({ resolve, reject, rejectCode }) => {
    if (rejectCode === undefined) resolve();
    else reject({ code: rejectCode, isRejected: true });
  });
};

/** Like Firestore, listeners hear that their data is now from the cache */
const loseServer = () =>
  listeners.forEach((listener) => {
    listener.fromCache = true;
    emit(listener);
  });

const setNavigatorOnLine = (isOnLine: boolean) => {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => isOnLine,
  });
};

const setNetwork = (next: Network) => {
  const wasOnLine = network !== 'offline';
  network = next;
  const isOnLine = next !== 'offline';
  setNavigatorOnLine(isOnLine);
  if (isOnLine !== wasOnLine) {
    window.dispatchEvent(new Event(isOnLine ? 'online' : 'offline'));
  }
};

const findDoc = (text: string) => {
  const found = [...server.values()].find(({ task }) => task.text === text);
  if (!found) throw new Error(`fakeCloud: no task "${text}" on the server`);
  return found;
};

const remoteServer: RemoteServer = {
  add: (quadrantKey, text) => {
    const order = [...server.values()].filter(
      (doc) => !doc.completed && doc.quadrantKey === quadrantKey,
    ).length;
    const id = `remote-${nextRemoteId++}`;
    server.set(id, {
      task: { id, text, createdAt: new Date() },
      quadrantKey,
      order,
      completed: false,
    });
  },
  remove: (text) => {
    server.delete(findDoc(text).task.id);
  },
  rename: (text, newText) => {
    findDoc(text).task.text = newText;
  },
  move: (text, quadrantKey) => {
    const doc = findDoc(text);
    doc.quadrantKey = quadrantKey;
    doc.order = [...server.values()].filter(
      (other) => !other.completed && other.quadrantKey === quadrantKey,
    ).length;
  },
};

/** Stands in for `@/shared/api/cloudMatrix/client` */
export const fakeCloudMatrixClient = {
  subscribe: (
    _uid: string,
    onNext: Listener['onNext'],
    onError: Listener['onError'],
  ) => {
    const listener: Listener = { onNext, onError, fromCache: true };
    listeners.add(listener);

    // Like onSnapshot, the first snapshots come asynchronously
    Promise.resolve().then(() => {
      if (!listeners.has(listener)) return;
      if (network === 'online') {
        if (isCacheWarm) emit(listener);
        syncWithServer();
      } else if (isCacheWarm || network === 'offline') {
        // Offline with nothing cached, Firestore gives an empty cached snapshot
        emit(listener);
      }
    });

    return () => {
      listeners.delete(listener);
    };
  },

  write: (_uid: string, changes: TaskChange[]) =>
    new Promise<void>((resolve, reject) => {
      if (stallsAtNextWrite) {
        stallsAtNextWrite = false;
        setNetwork('stalled');
        listeners.forEach((listener) => {
          listener.fromCache = true;
        });
      }
      queue.push({ changes, resolve, reject, rejectCode: nextRejectCode });
      nextRejectCode = undefined;
      emitAll();
      if (network === 'online') {
        Promise.resolve().then(() => {
          if (network === 'online' && queue.length > 0) syncWithServer();
        });
      }
    }),

  waitForPendingWrites: () =>
    new Promise<void>((resolve) => {
      if (queue.length === 0) {
        resolve();
        return;
      }
      // Like Firestore, a refused write counts as answered
      const last = queue[queue.length - 1];
      const { resolve: resolveLast, reject: rejectLast } = last;
      last.resolve = () => {
        resolveLast();
        resolve();
      };
      last.reject = (failure) => {
        rejectLast(failure);
        resolve();
      };
    }),

  clearDevice: async () => {
    // terminate() stops the listeners even when the clearing fails
    listeners.clear();
    if (isDeviceHeld) {
      // Like FirestoreError: clearIndexedDbPersistence doesn't map it
      throw Object.assign(new Error('Firestore is running in another tab'), {
        code: 'failed-precondition',
      });
    }
    cache = new Map();
    isCacheWarm = false;
    queue = [];
  },
};

const notifyUser = () => userListeners.forEach((next) => next(user));

/** Stands in for `@/shared/api/auth/client` */
export const fakeAuthClient = {
  onUserChanged: (next: (user: CloudUser | null) => void) => {
    userListeners.add(next);
    next(user);
    return () => {
      userListeners.delete(next);
    };
  },
  signInWithGoogle: async () => {
    user = lastUser ?? {
      uid: 'u1',
      displayName: 'Ada',
      email: 'ada@example.com',
      photoURL: null,
    };
    notifyUser();
    return user;
  },
  signInWithGithub: async () => fakeAuthClient.signInWithGoogle(),
  signOut: async () => {
    user = null;
    notifyUser();
  },
};

export interface SignedInUser {
  uid: string;
  displayName: string;
  /** By default the name in lower case at example.com */
  email?: string;
}

export interface CloudOptions {
  /** Active tasks per quadrant on the server */
  tasks?: Partial<Record<MatrixKey, (string | Task)[]>>;
  completedTasks?: Task[];
  /** 'warm': IndexedDB holds the server's tasks from an earlier visit */
  deviceCache?: 'warm' | 'empty';
  /** 'stalled': the network is up, the server doesn't answer */
  network?: Network;
}

const SEED_DATE = new Date('2026-09-20T10:00:00.000Z');

/** Starts a test from a clean slate: a new server, device and user */
export const resetFakeCloud = (
  signedIn: SignedInUser | undefined,
  {
    tasks = {},
    completedTasks = [],
    deviceCache = 'warm',
    network: startNetwork = 'online',
  }: CloudOptions = {},
) => {
  server = new Map();
  (Object.keys(tasks) as MatrixKey[]).forEach((quadrantKey) => {
    tasks[quadrantKey]!.forEach((seed, order) => {
      const task =
        typeof seed === 'string'
          ? {
              id: `cloud-${quadrantKey}-${order}`,
              text: seed,
              createdAt: SEED_DATE,
            }
          : seed;
      server.set(task.id, { task, quadrantKey, order, completed: false });
    });
  });
  completedTasks.forEach((task, order) => {
    server.set(task.id, {
      task,
      quadrantKey: task.quadrantKey ?? 'NotImportantNotUrgent',
      order,
      completed: true,
    });
  });

  isCacheWarm = deviceCache === 'warm';
  isDeviceHeld = false;
  cache = isCacheWarm ? copyDocs(server) : new Map();
  queue = [];
  nextRejectCode = undefined;
  stallsAtNextWrite = false;
  listeners = new Set();
  userListeners = new Set();
  nextRemoteId = 0;
  network = startNetwork;
  setNavigatorOnLine(startNetwork !== 'offline');
  user = signedIn
    ? {
        email: `${signedIn.displayName.toLowerCase()}@example.com`,
        ...signedIn,
        photoURL: null,
      }
    : null;
  lastUser = user;
};

/** Drops the page's subscriptions; the device cache and the queue stay */
export const forgetFakeCloudListeners = () => {
  listeners = new Set();
  userListeners = new Set();
};

const texts = (tasks: Task[]) => tasks.map(({ text }) => text);

/** Test controls of the fake cloud */
export const cloud = {
  goOffline: () =>
    act(() => {
      setNetwork('offline');
      loseServer();
    }),
  /** The network is up, but the server doesn't answer */
  stall: () =>
    act(() => {
      setNetwork('stalled');
      loseServer();
    }),
  goOnline: () =>
    act(() => {
      setNetwork('online');
      syncWithServer();
    }),
  /** A change made on another device or tab */
  remoteChange: (change: (server: RemoteServer) => void) =>
    act(() => {
      change(remoteServer);
      if (network === 'online') syncWithServer();
    }),
  /** The server refuses the next write with this Firestore code */
  rejectNextWrite: (code = 'permission-denied') => {
    nextRejectCode = code;
  },
  /** The server stops answering just as the next write goes out */
  stallNextWrite: () => {
    stallsAtNextWrite = true;
  },
  /** Fails the live subscription, as Firestore does on a lost permission */
  failSubscription: (code = 'permission-denied') =>
    act(() => {
      const failed = listeners;
      listeners = new Set();
      failed.forEach(({ onError }) => onError({ code, isRejected: true }));
    }),
  /** The session ends without Sign out: the auth client reports no user */
  expireSession: () =>
    act(() => {
      user = null;
      notifyUser();
    }),
  /** Another tab keeps IndexedDB open, so clearing the device fails */
  holdDeviceInAnotherTab: () => {
    isDeviceHeld = true;
  },
  /** The other tab is closed */
  closeAnotherTab: () => {
    isDeviceHeld = false;
  },
  /** Every task text the device keeps: its cache and the queue on top */
  deviceTasks: () => [...localDocs().values()].map(({ task }) => task.text),
  /** What the server holds now, by task text */
  serverTasks: () => {
    const { tasks, completedTasks } = toSnapshot(server, false);
    return {
      ...(Object.fromEntries(
        MATRIX_KEYS.map((key) => [key, texts(tasks[key])]),
      ) as Record<MatrixKey, string[]>),
      completed: texts(completedTasks),
    };
  },
};
