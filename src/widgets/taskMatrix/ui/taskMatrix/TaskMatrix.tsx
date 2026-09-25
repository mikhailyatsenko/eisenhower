'use client';

import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { CopyLocalToCloudButton } from '@/features/copyTasksToCloud';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { TaskActionPanel } from '@/features/selectTask';
import { completeTask, deleteTask, moveTask } from '@/features/undo';
import { useAuth } from '@/shared/api/auth';
import { useSyncStore } from '@/shared/stores/syncStore';
import { useTaskStore } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { LoaderFullScreen } from '@/shared/ui/loader';
import { TaskListView } from '../taskListView/TaskListView';
import { TaskMatrixHeaders } from '../taskMatrixHeader/TaskMatrixHeaders';

export const TaskMatrix: React.FC = () => {
  const { isLoading, user } = useAuth();
  const tasks = useTaskStore((state) =>
    state.activeState === 'local' ? state.localTasks : state.firebaseTasks,
  );
  const viewMode = useUIStore((state) => state.viewMode);
  const fullScreenQuadrant = useUIStore((state) => state.fullScreenQuadrant);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Use specific selector to prevent unnecessary re-renders
  const taskInputText = useUIStore((state) => state.taskInputText);

  // Until the cloud Matrix arrives; an error doesn't hide the Matrix
  const isWaitingForCloud = useTaskStore(
    (state) => state.activeState === 'firebase' && !state.isCloudLoaded,
  );

  const isInCloudStorage = useTaskStore(
    (state) => state.activeState === 'firebase',
  );
  const isAwaitingServer = useSyncStore((state) => state.isAwaitingServer);

  if (isLoading || (user && isWaitingForCloud)) {
    return <LoaderFullScreen />;
  }

  return (
    <>
      {/* The Matrix is on screen without the server: the tasks aren't lost */}
      {user && isInCloudStorage && isAwaitingServer && (
        <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
          Your tasks are in your account. They&apos;ll appear when you&apos;re
          back online.
        </p>
      )}

      {/* Focus lands here, not on <body>, when the matrix has no task left */}
      <div
        ref={matrixRef}
        role="group"
        aria-label="Task matrix"
        tabIndex={-1}
        // The phone grid's axis labels are small: less room above it
        className={twMerge(
          'relative mt-14 flex w-full flex-wrap justify-center rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700 dark:focus-visible:outline-indigo-300',
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

      <CopyLocalToCloudButton />
    </>
  );
};
