import { useSyncExternalStore } from 'react';
import { useUIStore } from './index';

const subscribe = (onChange: () => void) =>
  useUIStore.persist.onFinishHydration(onChange);

const isRestored = () => useUIStore.persist.hasHydrated();

// The server has no localStorage: its HTML never knows the stored view
const isRestoredOnServer = () => false;

/**
 * The device's UI state, such as the view, is read back from localStorage.
 * False while hydrating the server's HTML, true on the render after it.
 */
export const useIsUIStoreRestored = () =>
  useSyncExternalStore(subscribe, isRestored, isRestoredOnServer);
