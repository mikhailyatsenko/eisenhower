'use client';

import { useCallback, useEffect, useState } from 'react';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { useAuth } from '@/shared/api/auth';
import { MatrixKey, syncTasks, useTaskStore } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { LoaderFullScreen } from '@/shared/ui/loader';
import { TaskMatrixHeaders } from '../taskMatrixHeader/TaskMatrixHeaders';

export const TaskMatrix: React.FC = () => {
  const { isLoading, user } = useAuth();

  // Use specific selector to prevent unnecessary re-renders
  const taskInputText = useUIStore((state) => state.taskInputText);

  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );
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
    <div className="relative flex w-full flex-wrap justify-center">
      {!expandedQuadrant && !taskInputText && <TaskMatrixHeaders />}

      <InteractWithMatrix
        expandedQuadrant={expandedQuadrant}
        setExpandedQuadrant={setExpandedQuadrant}
        taskInputText={taskInputText}
      />
    </div>
  );
};
