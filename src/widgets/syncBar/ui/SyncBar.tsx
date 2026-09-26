'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/shared/api/auth';
import {
  SyncBarState,
  SyncErrorAction,
  useSyncStore,
} from '@/shared/stores/syncStore';
import { reloadCloudMatrixAction } from '@/shared/stores/tasksStore';
import { requestTaskFocusAction, useUIStore } from '@/shared/stores/uiStore';

type NeutralKind = Exclude<SyncBarState['kind'], 'hidden' | 'error'>;

const TEXTS: Record<NeutralKind, string> = {
  offline:
    "You're offline. Changes are saved on this device and will sync when you're back online.",
  syncing: 'Syncing…',
  saved: 'All changes saved',
};

const ERROR_TEXT = "Some changes couldn't be saved to your account.";

/**
 * Full width right under the header, sticky with it: pushes the page down
 * while it shows and stays in view on scroll. One status region for the neutral
 * states, so each is announced once; empty, it takes no space. A Sync error
 * takes its place as an alert with a way to set it right.
 */
export const SyncBar = () => {
  const bar = useSyncStore((state) => state.bar);
  const { handleGoogleSignIn } = useAuth();
  const errorActions: Record<
    SyncErrorAction,
    { label: string; run: () => void }
  > = {
    reload: { label: 'Reload', run: reloadCloudMatrixAction },
    signIn: { label: 'Sign in again', run: handleGoogleSignIn },
  };
  const errorAction = bar.kind === 'error' ? errorActions[bar.action] : null;
  const hasError = errorAction !== null;
  const barRef = useRef<HTMLDivElement>(null);
  const hasFocusInError = useRef(false);

  // The error goes with its button: focus goes to the selected task or stays
  // at the bar's place, not on <body>
  useEffect(() => {
    if (hasError || !hasFocusInError.current) return;
    hasFocusInError.current = false;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    const { selectedTaskId } = useUIStore.getState();
    if (selectedTaskId) requestTaskFocusAction(selectedTaskId);
    else barRef.current?.focus();
  }, [hasError]);

  return (
    <div ref={barRef} tabIndex={-1} className="outline-none">
      <div role="status" aria-label="Sync status">
        {bar.kind !== 'hidden' && bar.kind !== 'error' && (
          <p className="border-y border-gray-200 bg-gray-100 px-4 py-2 text-center text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            {TEXTS[bar.kind]}
          </p>
        )}
      </div>
      {errorAction && (
        <div
          role="alert"
          onFocus={() => {
            hasFocusInError.current = true;
          }}
          onBlur={(event) => {
            // Leaving for another element; the button's own removal has none
            if (event.relatedTarget) hasFocusInError.current = false;
          }}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-y border-red-200 bg-red-50 px-4 py-1 text-center text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p>{ERROR_TEXT}</p>
          <button
            type="button"
            onClick={errorAction.run}
            className="min-h-9 cursor-pointer rounded-md border border-red-700 px-3 font-bold hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none dark:border-red-300 dark:hover:bg-red-900 dark:focus-visible:ring-red-300"
          >
            {errorAction.label}
          </button>
        </div>
      )}
    </div>
  );
};
