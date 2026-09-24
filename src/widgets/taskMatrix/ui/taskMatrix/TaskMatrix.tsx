'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { CopyLocalToCloudButton } from '@/features/copyTasksToCloud';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { TaskActionPanel } from '@/features/selectTask';
import { completeTask, deleteTask, moveTask } from '@/features/undo';
import { useAuth } from '@/shared/api/auth';
import { syncTasks, useTaskStore } from '@/shared/stores/tasksStore';
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

  const [syncState, setSyncState] = useState<{
    isSyncing: boolean;
    error: string | null;
  }>({
    isSyncing: false,
    error: null,
  });

  const fetchTasks = useCallback(async () => {
    setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));
    try {
      if (user) {
        await syncTasks();
      } else {
        useTaskStore.setState((state) => {
          state.firebaseTasks = {
            ImportantUrgent: [],
            ImportantNotUrgent: [],
            NotImportantUrgent: [],
            NotImportantNotUrgent: [],
          };
        });
      }
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sync tasks',
      }));
    } finally {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (isLoading || syncState.isSyncing) {
    return <LoaderFullScreen />;
  }

  if (syncState.error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        {syncState.error}
      </div>
    );
  }

  return (
    <>
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
