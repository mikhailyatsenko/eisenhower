'use client';

import { useEffect, useState } from 'react';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { useAuth } from '@/shared/api/auth';
import { MatrixKey, syncTasks, useTaskStore } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { LoaderFullScreen } from '@/shared/ui/loader';
import { TaskMatrixHeaders } from '../taskMatrixHeader/TaskMatrixHeaders';

export const TaskMatrix: React.FC = () => {
  const { isLoading } = useAuth();

  const { taskInputText } = useUIStore();

  const [expandedQuadrant, setExpandedQuadrant] = useState<MatrixKey | null>(
    null,
  );

  const { user } = useAuth();

  const [isSyncingTasks, setIsSyncingTasks] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsSyncingTasks(true);
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
      setIsSyncingTasks(false);
    };

    fetchTasks();
  }, [user]);

  if (isLoading || isSyncingTasks) {
    return <LoaderFullScreen />;
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
