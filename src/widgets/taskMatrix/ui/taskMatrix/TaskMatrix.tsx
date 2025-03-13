'use client';

import { useEffect, useState } from 'react';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import { TaskMatrixHeaders } from '@/entities/taskMatrixHeaders';
import { MatrixKey, syncTasks, useTaskStore } from '@/entities/Tasks';
import { getTaskInputText } from '@/entities/Tasks';
import { useUIStore } from '@/entities/Tasks';
import { useAuth } from '@/shared/api/auth';
import { LoaderFullScreen } from '@/shared/ui/loader';

export const TaskMatrix: React.FC = () => {
  const { isLoading } = useAuth();

  const taskInputText = useUIStore(getTaskInputText);

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
