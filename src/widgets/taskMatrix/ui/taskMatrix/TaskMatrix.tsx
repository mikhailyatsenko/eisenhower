'use client';

import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { InlineAddField, QuadrantAddButton } from '@/features/addTask';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { SelectionHint, TaskActionPanel } from '@/features/selectTask';
import { ViewPanel } from '@/features/switchViewMode';
import { completeTask, deleteTask, moveTask } from '@/features/undo';
import { QuadrantSlots } from '@/entities/matrixLayout';
import { useAuth } from '@/shared/api/auth';
import { forgetSignOut, useIsSignedOut } from '@/shared/api/cloudMatrix';
import { useSyncStore } from '@/shared/stores/syncStore';
import {
  selectTasks,
  useIsTaskStoreRestored,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import {
  openInlineAddAction,
  openInlineAddByEmptySpaceAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { LoaderFullScreen } from '@/shared/ui/loader';
import { NoSignUpLine } from '../../components/NoSignUpLine';
import { SignedOutLine } from '../../components/SignedOutLine';
import { TaskListView } from '../taskListView/TaskListView';
import { TaskMatrixHeaders } from '../taskMatrixHeader/TaskMatrixHeaders';

// Adding in the quadrant: its "+", the inline field, a click on empty space
// and "Add a task"
const QUADRANT_SLOTS: QuadrantSlots = {
  headerAction: (quadrant) => <QuadrantAddButton quadrant={quadrant} />,
  listEnd: (quadrant) => <InlineAddField quadrant={quadrant} />,
  openAddField: openInlineAddAction,
  openAddFieldByEmptySpace: openInlineAddByEmptySpaceAction,
};

export const TaskMatrix: React.FC = () => {
  const { isLoading, user, handleGoogleSignIn } = useAuth();
  const tasks = useTaskStore(selectTasks);
  const viewMode = useUIStore((state) => state.viewMode);
  const fullScreenQuadrant = useUIStore((state) => state.fullScreenQuadrant);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Use specific selector to prevent unnecessary re-renders
  const taskInputText = useUIStore((state) => state.taskInputText);

  // Until the cloud Matrix arrives, from the moment the user is known: the
  // device's tasks never flash in between. An error doesn't hide the Matrix.
  const isCloudLoaded = useTaskStore((state) => state.isCloudLoaded);

  const isInCloudStorage = useTaskStore((state) => state.isInCloud);
  const isAwaitingServer = useSyncStore((state) => state.isAwaitingServer);

  // The account's tasks haven't come yet: examples would make it look empty
  const isAccountAwaited = !!user && isInCloudStorage && isAwaitingServer;

  // Not before the device's tasks are read: a returning user would see it
  // flash. The device's tasks, not the Matrix's: on sign-out the user is
  // gone a render before the cloud subscription ends.
  const isTaskStoreRestored = useIsTaskStoreRestored();
  const isDeviceMatrixEmpty = useTaskStore((state) =>
    Object.values(state.localTasks).every(
      (quadrantTasks) => quadrantTasks.length === 0,
    ),
  );
  const isAnonymousRestored = !user && isTaskStoreRestored;
  const isEmptyForAnonymous = isAnonymousRestored && isDeviceMatrixEmpty;

  // After Sign out the empty matrix isn't a first visit: the tasks are in
  // the account. The first task added to it ends that for good; tasks left
  // on the device by "Don't add" or Undo don't.
  const isSignedOut = useIsSignedOut();
  const wasEmptyForAnonymous = useRef(false);
  useEffect(() => {
    const isTaskAdded =
      wasEmptyForAnonymous.current &&
      isAnonymousRestored &&
      !isDeviceMatrixEmpty;
    if (isTaskAdded) forgetSignOut();
    wasEmptyForAnonymous.current = isEmptyForAnonymous;
  }, [isAnonymousRestored, isDeviceMatrixEmpty, isEmptyForAnonymous]);

  if (isLoading || (user && !isCloudLoaded)) {
    // The view tabs are already in the header: their panel is here too
    return (
      <ViewPanel>
        <LoaderFullScreen />
      </ViewPanel>
    );
  }

  return (
    <>
      {/* The Matrix is on screen without the server: the tasks aren't lost */}
      {isAccountAwaited && (
        <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
          Your tasks are in your account. They&apos;ll appear when you&apos;re
          back online.
        </p>
      )}
      {isEmptyForAnonymous &&
        (isSignedOut ? (
          <SignedOutLine signIn={handleGoogleSignIn} />
        ) : (
          <NoSignUpLine />
        ))}

      {/* The area the view tabs in the header switch */}
      <ViewPanel>
        {/* Focus lands here, not on <body>, when the matrix has no task left */}
        <div
          ref={matrixRef}
          role="group"
          aria-label="Task matrix"
          tabIndex={-1}
          // The phone grid's axis labels are small: less room above it
          className={twMerge(
            'relative mt-14 flex w-full flex-wrap justify-center rounded-lg outline-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700 dark:focus-visible:outline-indigo-300',
            viewMode === 'matrix' && 'mt-5 sm:mt-14',
          )}
        >
          {viewMode === 'matrix' ? (
            <>
              {/* The stored quadrant opens on a phone only, hence max-sm */}
              {!taskInputText && (
                <TaskMatrixHeaders
                  isHiddenOnPhone={fullScreenQuadrant !== null}
                />
              )}

              <InteractWithMatrix
                taskInputText={taskInputText}
                moveTask={moveTask}
                quadrantSlots={QUADRANT_SLOTS}
                hasExamples={!isAccountAwaited}
              />
            </>
          ) : (
            <TaskListView tasks={tasks} />
          )}

          {/* In List view too: it keeps the keys that open the add form */}
          <TaskActionPanel
            tasks={tasks}
            matrixRef={matrixRef}
            completeTask={completeTask}
            deleteTask={deleteTask}
            moveTask={moveTask}
          />
        </div>
      </ViewPanel>

      {/* Selection comes to List view in slice N, the line with it */}
      {viewMode === 'matrix' && <SelectionHint />}
    </>
  );
};
