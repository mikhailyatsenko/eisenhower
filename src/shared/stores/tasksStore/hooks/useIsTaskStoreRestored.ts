import { useSyncExternalStore } from 'react';
import { useTaskStore } from './useTasksStore';

const subscribe = (onChange: () => void) =>
  useTaskStore.persist.onFinishHydration(onChange);

const isRestored = () => useTaskStore.persist.hasHydrated();

// The server has no localStorage: its HTML never counts the tasks as restored
const isRestoredOnServer = () => false;

/** The device's tasks are read back from localStorage */
export const useIsTaskStoreRestored = () =>
  useSyncExternalStore(subscribe, isRestored, isRestoredOnServer);
