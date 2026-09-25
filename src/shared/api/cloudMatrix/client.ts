import {
  Firestore,
  clearIndexedDbPersistence,
  collection,
  doc,
  getFirestore,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  terminate,
  waitForPendingWrites as waitForFirestoreWrites,
  where,
  writeBatch,
} from 'firebase/firestore';
import { app } from '@/shared/config/firebaseConfig';
import { taskToDocData, toCloudSnapshot, toSyncFailure } from './lib';
import {
  CloudSnapshot,
  FirestoreTaskData,
  SyncFailure,
  TaskChange,
  Unsubscribe,
} from './types';

// The only module that talks to Firestore. The Matrix is cached on the device
// (IndexedDB, shared by all tabs), so it opens and takes changes offline.

const COLLECTION = 'tasks';
const BATCH_LIMIT = 500;

let db: Firestore | null = null;

// Created on first use, and again after clearDevice: terminate() ends it for
// good and removes it from the app, so initializeFirestore works once more
const getDb = () => {
  if (!db) {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Already initialized on this app, e.g. after a hot reload in dev
      db = getFirestore(app);
    }
  }
  return db;
};

/** Every snapshot of the user's Matrix, local changes included, until unsubscribed */
export const subscribe = (
  uid: string,
  onNext: (snapshot: CloudSnapshot) => void,
  onError: (failure: SyncFailure) => void,
): Unsubscribe =>
  onSnapshot(
    query(collection(getDb(), COLLECTION), where('userId', '==', uid)),
    { includeMetadataChanges: true },
    (snapshot) =>
      onNext(
        toCloudSnapshot(
          snapshot.docs.map((taskDoc) => ({
            id: taskDoc.id,
            data: taskDoc.data() as FirestoreTaskData,
          })),
          {
            fromCache: snapshot.metadata.fromCache,
            hasPendingWrites: snapshot.metadata.hasPendingWrites,
          },
        ),
      ),
    (error) => onError(toSyncFailure(error)),
  );

/**
 * Applies the changes on the device at once. Resolves when the server has
 * them; rejects if it refuses. Without a network it waits, it doesn't fail.
 */
export const write = async (uid: string, changes: TaskChange[]) => {
  const firestore = getDb();
  const commits: Promise<void>[] = [];

  for (let i = 0; i < changes.length; i += BATCH_LIMIT) {
    const batch = writeBatch(firestore);
    changes.slice(i, i + BATCH_LIMIT).forEach((change) => {
      if (change.type === 'delete') {
        batch.delete(doc(firestore, COLLECTION, change.id));
      } else {
        batch.set(
          doc(firestore, COLLECTION, change.task.id),
          taskToDocData(change, uid),
        );
      }
    });
    commits.push(batch.commit());
  }

  try {
    await Promise.all(commits);
  } catch (error) {
    throw toSyncFailure(error);
  }
};

/** Resolves once the server has every change made so far */
export const waitForPendingWrites = () => waitForFirestoreWrites(getDb());

/** Ends the Firestore instance and deletes its cache and queue on the device */
export const clearDevice = async () => {
  const firestore = getDb();
  db = null;
  await terminate(firestore);
  await clearIndexedDbPersistence(firestore);
};
